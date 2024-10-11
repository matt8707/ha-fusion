import Konva from 'konva';
import { KonvaBase } from '$lib/Modal/PictureElements/konvaBase';
import { get } from 'svelte/store';
import { editMode, states, connection } from '$lib/Stores';
import { callService } from 'home-assistant-js-websocket';
import type { ContainerConfig } from 'konva/lib/Container';

/**
 * Picture elements
 */
export class KonvaViewer extends KonvaBase {
	constructor(container: HTMLDivElement, data: ContainerConfig) {
		super(container, data);

		this.handleMount();
		this.subscribeStates();
	}

	/**
	 * Handles mount
	 * - removes guides and hidden shapes
	 * - disables `draggable` attribute
	 * - handles state-label with no entity_id
	 * - loads images and icons
	 * - updates $konvaImageCache
	 */
	private async handleMount() {
		this.layer
			.getChildren((node) => node instanceof Konva.Shape || node instanceof Konva.Group)
			.forEach((node) => {
				if (!node.isVisible() || this.isGuide(node)) {
					node.remove();
				} else {
					this.handleNodeClick(node);

					if (node?.attrs?.type === 'state-label' && node instanceof Konva.Text) {
						this.updateStateLabel(node, undefined);
					}
				}
			});

		await Promise.all(
			this.layer.find('Image').map(async (node) => {
				if (node instanceof Konva.Image) {
					const type = node.attrs.type;
					switch (type) {
						case 'icon':
						case 'state-icon':
							await this.updateIcon(node);
							break;
						case 'image':
							await this.updateImage(node, node.getAttr('src'), false);
							if (node.getAttr('id')) {
								const image = node.image();
								if (image instanceof HTMLImageElement) {
									this.updateImageCache(node.getAttr('id'), image);
								}
							}
							break;
					}
				}
			})
		);

		// update state-icon again when everything's loaded
		await Promise.all(
			this.layer.find('Image').map(async (node) => {
				if (node instanceof Konva.Image && node.attrs.type === 'state-icon') {
					await this.updateStateIcon(node, undefined);
				}
			})
		);
	}

	/**
	 * Subscribes to $states store
	 * and updates 'state-' shapes
	 */
	private subscribeStates() {
		this.unsubscribe = states.subscribe(($states) => {
			if (this.layer && $states) {
				const nodes = this.layer.getChildren(
					(node) => node.getAttr('entity_id') && node?.attrs?.type?.startsWith('state-')
				);
				nodes.forEach((node) => {
					if (node instanceof Konva.Image) {
						this.updateStateIcon(node, $states);
					} else if (node instanceof Konva.Text) {
						this.updateStateLabel(node, $states);
					}
				});
			}
		});
	}

	/**
	 * Handle click events
	 */
	private handleNodeClick(node: Konva.Node) {
		const onclick = node.getAttr('onclick');

		node.listening(!!onclick);
		node.draggable(false);
		node.off('mouseenter mouseleave click tap');

		if (onclick && typeof onclick === 'object') {
			const setCursor = (cursor: string) => {
				this.stage.container().style.cursor = get(editMode) ? 'unset' : cursor;
			};

			node.on('mouseenter', () => setCursor('pointer'));
			node.on('mouseleave', () => setCursor('default'));

			node.on('click tap', async () => {
				if (get(editMode)) return;

				const conn = get(connection);
				if (!conn) {
					console.error('No connection', conn);
					return;
				}

				const { domain, service, data, target } = onclick;

				if (!domain || !service) {
					console.error('Invalid service call', onclick);
					return;
				}

				const pos = this.stage.getPointerPosition();
				if (pos) this.ripple(pos.x, pos.y);

				try {
					await callService(conn, domain, service, data, target);
				} catch (err) {
					console.error('Error calling service:', err);
				}
			});
		}
	}

	/**
	 * Updates layer children
	 * - removes nonexistent nodes
	 * - updates or creates nodes
	 * - updates $konvaImageCache
	 */
	public async updateLayerChildren(data: any[]) {
		this.layer
			.getChildren((node) => !data.some((nodeData) => nodeData?.attrs?.id === node.getAttr('id')))
			.forEach((node) => node.destroy());

		await Promise.all(
			data
				.filter((nodeData) => !this.isGuide(nodeData))
				.map(async (nodeData, index) => {
					let node = this.layer.findOne(`#${nodeData?.attrs?.id}`) as Konva.Node;
					if (node) {
						await this.updateNode(node, nodeData);
					} else {
						node = await this.createNode(nodeData);
						this.layer.add(node as Konva.Shape | Konva.Group);
					}
					if (node) {
						node.zIndex(index);

						if (node instanceof Konva.Image && node.getAttr('id')) {
							const image = node.image();
							if (image instanceof HTMLImageElement) {
								this.updateImageCache(node.getAttr('id'), image);
							}
						}
					}
				})
		);
	}

	/**
	 * Handle node updates
	 * - updates `onclick` attribute
	 * - updates node attributes
	 * - loads any icons/images
	 *
	 * does not update reactive attributes:
	 * - state-label `text`
	 * - state-icon `image`, `icon` and `state_color`
	 */
	private async updateNode(node: Konva.Node, nodeData: Konva.Node) {
		const onclick = nodeData?.attrs?.onclick;
		node.setAttr('onclick', onclick ? JSON.parse(JSON.stringify(onclick)) : undefined);

		const type = node?.attrs?.type;
		if (type === 'state-label' && node instanceof Konva.Text) {
			node.setAttrs({
				...nodeData?.attrs,
				text: node.getAttr('text')
			});
		} else if (type === 'state-icon' && node instanceof Konva.Image) {
			node.setAttrs({
				...nodeData?.attrs,
				...{
					image: node.getAttr('image'),
					icon: node.getAttr('icon'),
					state_color: node.getAttr('state_color')
				}
			});
		} else {
			node.setAttrs(nodeData?.attrs);
		}

		if (node instanceof Konva.Image) {
			if (type === 'state-icon') {
				await this.updateStateIcon(node, undefined);
			} else if (type === 'icon') {
				await this.updateIcon(node);
			} else if (type === 'image') {
				await this.updateImage(node, node.getAttr('src'), false);
			}
		}

		this.handleNodeClick(node);
	}

	/**
	 * Handle node creation
	 */
	private async createNode(nodeData: Konva.Node) {
		let node;

		const attrs = nodeData?.attrs;
		const type = attrs?.type;
		switch (type) {
			case 'state-label':
				node = new Konva.Text(attrs);
				this.updateStateLabel(node, undefined);
				break;
			case 'state-icon':
				node = new Konva.Image(attrs);
				this.updateStateIcon(node, undefined);
				break;
			case 'text':
				node = new Konva.Text(attrs);
				break;
			case 'icon':
				node = new Konva.Image(attrs);
				await this.updateIcon(node);
				break;
			case 'image':
				node = new Konva.Image(attrs);
				await this.updateImage(node, attrs?.src, false);
				break;
			case 'rectangle':
				node = new Konva.Rect(attrs);
				break;
			case 'circle':
				node = new Konva.Circle(attrs);
				break;
			case 'group':
				node = new Konva.Group(attrs);
				if ('children' in nodeData && Array.isArray(nodeData?.children)) {
					for (const child of nodeData.children) {
						// recursive
						const childNode = await this.createNode(child);
						node.add(childNode);
					}
				}
				break;
			default:
				console.error(type, 'type not found');
				node = new Konva.Shape(attrs);
		}

		this.handleNodeClick(node);

		return node;
	}

	/**
	 * Handle ripple effect
	 */
	private ripple(x: number, y: number) {
		const shape = new Konva.Circle({
			x,
			y,
			fill: 'rgba(255, 255, 255, 0.75)'
		});

		this.layer.add(shape);

		const duration = 380;
		const radius = 35;

		const animation = new Konva.Animation((frame) => {
			if (!frame) return;

			const progress = Math.min(frame.time / duration, 1);
			shape.radius(Konva.Easings.StrongEaseOut(progress, 0, radius, 1));
			shape.opacity(Konva.Easings.StrongEaseOut(progress, 1, -1, 1));

			if (progress >= 1) {
				animation.stop();
				shape.destroy();
			}
		}, this.layer).start();
	}

	/**
	 * Destroy konva
	 */
	public destroyViewer() {
		this.unsubscribe?.();
		super.destroyBase();
	}
}
