import Konva from 'konva';
import { KonvaBase } from '$lib/Modal/PictureElements/konvaBase';
import { get } from 'svelte/store';
import { states, konvaStore, konvaImageCache } from '$lib/Stores';
import { tick } from 'svelte';
import type { Box } from 'konva/lib/shapes/Transformer';
import type { ContainerConfig } from 'konva/lib/Container';
import type { ShapeConfig } from 'konva/lib/Shape';
import type { KonvaMode, KonvaHistory } from '$lib/Types';
import { icons } from './icons';

/**
 * Picture elements config
 */
export class KonvaEditor extends KonvaBase {
	// canvas
	private canvasLayer = new Konva.Layer();
	public canvas = new Konva.Rect();
	private readonly canvasWidth = 470;
	private readonly canvasHeight = 265;
	private dragDirection: 'x' | 'y' | undefined;

	// mode
	private mode: KonvaMode = 'default';

	// select
	private selectionLayer = new Konva.Layer();
	public transformer = new Konva.Transformer();
	private selectionRect = new Konva.Rect();

	private x1 = 0;
	private y1 = 0;
	private x2 = 0;
	private y2 = 0;

	private readonly selectionThreshold = 5;
	private selectionStartX: number = 0;
	private selectionStartY: number = 0;

	public selecting = false;
	public shiftPressed: boolean = false;
	private dragSelecting = false;
	private selectedShapes: (Konva.Shape | Konva.Group)[] = [];

	// pan
	private panning = false;
	public spaceKey = false;

	// zoom
	private zoomFactor = 1;
	private readonly minZoom = 0.4;
	private readonly maxZoom = 40;
	private currentTween: Konva.Tween | undefined;
	public altKey = false;

	// history
	private undoStack: KonvaHistory[] = [];
	private redoStack: KonvaHistory[] = [];
	private readonly maxHistory = 50;
	private applyingState = false;

	// guides
	private readonly snapOffset = 5;
	private guides: Konva.Line[] = [];

	constructor(container: HTMLDivElement, data: ContainerConfig) {
		super(container, data);

		this.handleMount();
		this.setupCanvas();
		this.setupTransformer();
		this.setupEvents();
		this.subscribeStates();

		// reset zoom on mount to fix grapical issue with zoomToArea
		const point = { x: this.stage.width() / 2, y: this.stage.height() / 2 };
		this.setZoom('reset', point);

		this.update();
	}

	/**
	 * Update $konvaStore to render ui updates
	 */
	private update() {
		konvaStore.set({
			children: this.layer.toObject()?.children || [],
			selectedShapes: this.selectedShapes.map((shape) => this.getNodeData(shape)),
			mode: this.mode,
			undoStack: this.undoStack,
			redoStack: this.redoStack
		});
	}

	/**
	 * Runs update if called from `KonvaBase`
	 */
	protected updateCallback() {
		this.update();
	}

	/**
	 * Handles mount
	 * - handles state-label with no entity_id
	 * - loads images from $konvaImageCache
	 */
	private async handleMount() {
		this.layer.find('Text').forEach((node) => {
			if (node?.attrs?.type === 'state-label' && node instanceof Konva.Text) {
				this.updateStateLabel(node, undefined);
			}
		});

		const images = this.layer.find('Image');
		const imageCache = get(konvaImageCache)?.[this.selId] || {};

		await Promise.all(
			images.map(async (node) => {
				if (node instanceof Konva.Image) {
					const cachedImage = imageCache[node.id()];
					const src = node.getAttr('src');

					if (cachedImage instanceof HTMLImageElement) {
						node.image(cachedImage);
					} else {
						await this.updateImage(node, src, false);
						const image = node.image();
						if (image instanceof HTMLImageElement && node.id()) {
							this.updateImageCache(node.id(), image);
						}
					}
				}
			})
		);

		this.record();
		this.update();
	}

	/**
	 * Setup canvas layer
	 */
	private setupCanvas() {
		this.stage.add(this.canvasLayer);
		this.canvasLayer.moveToBottom();
		this.canvasLayer.listening(false);

		this.canvas.setAttrs({
			x: (this.stage.width() - this.canvasWidth) / 2,
			y: (this.stage.height() - this.canvasHeight) / 2,
			width: this.canvasWidth,
			height: this.canvasHeight,
			fill: 'rgba(0, 0, 0, 0.2)',
			stroke: 'rgba(255, 255, 255, 0.25)',
			strokeWidth: 1,
			strokeScaleEnabled: false,
			cornerRadius: 9.6
		});
		this.canvasLayer.add(this.canvas);

		this.layer.position({
			x: this.canvas.x(),
			y: this.canvas.y()
		});
	}

	/**
	 * Setup selection layer
	 * - `rotationSnapTolerance` is half of a `rotationSnap`
	 * - handle dragging corner anchors when shift is pressed
	 * - limit `boundBox` if text node has custom `box` attribute
	 * - add any text `box` event listeners
	 * - add selection rectangle (mouse drag)
	 */
	private setupTransformer() {
		this.stage.add(this.selectionLayer);
		this.selectionLayer.add(this.transformer);

		this.transformer.setAttrs({
			keepRatio: true,
			rotationSnapTolerance: 15 / 2
		});

		this.transformer.on('transformstart transform transformend', (event) => {
			const activeAnchor = this.transformer.getActiveAnchor();
			const cornerHandles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
			if (activeAnchor && cornerHandles.includes(activeAnchor)) {
				this.transformer.shiftBehavior(this.transformer.keepRatio() ? 'inverted' : 'default');
			}

			this.transformer.setAttr('boundBoxFunc', (oldBox: Box, newBox: Box) => {
				const shapes = this.transformer.nodes();
				const textBox = shapes.some((shape) => shape instanceof Konva.Text && shape.getAttr('box'));
				return textBox && (newBox.width < 0 || newBox.height < 0) ? oldBox : newBox;
			});

			if (event.type === 'transformend') this.record();
			this.update();
		});

		const nodes = this.layer.find('Text') as Konva.Text[];
		nodes.forEach((node) => {
			if (node.getAttr('box')) {
				this.addTextBoxEventListener(node);
			}
		});

		this.selectionLayer.add(this.selectionRect);
		this.selectionRect.setAttrs({
			stroke: 'rgba(255, 255, 255, 0.75)',
			strokeWidth: 1,
			fill: 'rgba(255, 255, 255, 0.025)',
			visible: false,
			listening: false,
			strokeScaleEnabled: false
		});
	}

	/**
	 * Adds event listeners
	 * - handle click event
	 * - record history and update on drag event
	 * - handle mousedown/mouseup event
	 * - handle mousemove event
	 * - adds events guides
	 * - add events for alt-duplicate
	 * - adds guide snapping events
	 */
	private setupEvents() {
		this.stage.on('click tap dragstart', (event) => this.handleClick(event));

		this.stage.on('add remove dragmove dragend', (event) => {
			const { type, target } = event;

			if (type === 'dragmove' && this.panning) {
				this.updateGuidePos();
			}

			// prevent `record` when panning with guides drawn
			if (type === 'dragend' && target?.className !== undefined) {
				this.record();
			}

			this.update();
		});

		this.stage.on('mousedown', (event) => this.handleMousedown(event));
		window.addEventListener('mouseup', this.handleMouseup.bind(this));
		window.addEventListener('mousemove', this.handleMouseMove.bind(this));

		this.layer
			.find('Line')
			.filter((node) => this.isGuide(node))
			.forEach((node) => this.setupGuideEvents(node as Konva.Line));

		this.layer.on('dragmove', this.handleShiftDragMove);

		this.setupAltDuplicateEvents();
		this.setupGuideSnap();
	}

	/**
	 * Updates `v-guide | h-guide` position
	 *
	 * Guides are drawn to fit stage dimensions, so
	 * by zooming or panning they need to be updated
	 */
	public updateGuidePos = () => {
		const nodes = this.layer.find('Line').filter((node): node is Konva.Line => this.isGuide(node));

		if (!nodes?.length) {
			this.guides = [];
			return;
		}

		const stagePos = this.stage.position();
		const scaleX = this.stage.scaleX();
		const scaleY = this.stage.scaleY();

		this.guides = nodes.map((node) => {
			if (node?.attrs?.type === 'v-guide') {
				const lineX = node.points()[0];
				node.points([
					lineX,
					-stagePos.y / scaleY - this.canvas.y(),
					lineX,
					(this.stage.height() - stagePos.y) / scaleY - this.canvas.y()
				]);
			} else if (node?.attrs?.type === 'h-guide') {
				const lineY = node.points()[1];
				node.points([
					-stagePos.x / scaleX - this.canvas.x(),
					lineY,
					(this.stage.width() - stagePos.x) / scaleX - this.canvas.x(),
					lineY
				]);
			}
			return node;
		});
	};

	/**
	 * Handle click event
	 * - blurs any active input field so data can be saved
	 * - handle pan and zoom clicks
	 * - handle stage click (no nodes)
	 * - get node parent if group
	 * - handle mutiselect cmd click
	 */
	private async handleClick(event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
		const activeElement = document?.activeElement;
		if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
			activeElement.blur();
			await tick();
		}

		if (this.mode === 'pan' || this.spaceKey) return;

		if (this.mode === 'zoom') {
			const pointerPos = this.stage.getPointerPosition();
			if (pointerPos) {
				if (!this.altKey) {
					this.setZoom('in', pointerPos);
				} else if (this.altKey) {
					this.setZoom('out', pointerPos);
				}
			}
			return;
		}

		const target = event.target;

		if (target === this.stage) {
			this.deselectAll();
			this.update();
			return;
		}

		const getParentNode = (node: Konva.Node) => {
			const parent = node.getParent();
			if (parent !== this.layer && parent instanceof Konva.Group) {
				return getParentNode(parent);
			}
			return node;
		};

		const node = getParentNode(target);
		if (!node) return;

		if (node.visible() && node.draggable() && !this.isGuide(node)) {
			const { ctrlKey, metaKey } = event.evt;
			const cmd = ctrlKey || metaKey;
			const selected = this.transformer.nodes().indexOf(node) >= 0;

			type Node = Konva.Shape | Konva.Group;

			if (event.type === 'dragstart') {
				if (!selected) {
					if (!cmd) {
						this.transformer.nodes([node]);
						this.selectedShapes = [node as Node];
					} else {
						const nodes = this.transformer.nodes().concat([node]);
						this.transformer.nodes(nodes);
						this.selectedShapes = nodes as Node[];
					}
				}
			} else {
				if (!cmd && !selected) {
					this.transformer.nodes([node]);
					this.selectedShapes = [node as Node];
				} else if (cmd && selected) {
					const nodes = this.transformer.nodes().slice();
					nodes.splice(nodes.indexOf(node), 1);
					this.transformer.nodes(nodes);
					this.selectedShapes = nodes as Node[];
				} else if (cmd && !selected) {
					const nodes = this.transformer.nodes().concat([node]);
					this.transformer.nodes(nodes);
					this.selectedShapes = nodes as Node[];
				}
			}
		}

		this.update();
	}

	/**
	 * Handle mousedown event
	 * - handles panning
	 * - checks if target is `stage` or non-draggable node
	 * - starts selection rectangle
	 */
	private handleMousedown(event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
		if (this.mode === 'pan' || this.panning) return;

		const draggableNode = (node: Konva.Node): boolean => {
			if (node.draggable()) return true;
			const parent = node.getParent();
			return parent && parent !== this.stage ? draggableNode(parent) : false;
		};

		const target = event.target;
		const startSelection = target === this.stage || !draggableNode(target);

		if (startSelection) {
			event.evt.preventDefault();
			const pos = this.stage.getPointerPosition();
			if (pos) {
				const x = (pos.x - this.stage.x()) / this.zoomFactor;
				const y = (pos.y - this.stage.y()) / this.zoomFactor;
				this.x1 = this.x2 = x;
				this.y1 = this.y2 = y;
				this.selectionStartX = x;
				this.selectionStartY = y;
			}

			this.selectionRect.setAttrs({
				width: 0,
				height: 0,
				visible: false
			});

			this.selecting = true;
			this.dragSelecting = false;
		} else {
			this.selecting = false;

			if (target instanceof Konva.Shape || target instanceof Konva.Group) {
				target.setAttr('startPos', { x: target.x(), y: target.y() });
			}
		}
	}

	/**
	 * Handle mouseup event
	 * - handle `zoomToArea`
	 * - select nodes that intersects with selection rectangle
	 */
	private handleMouseup = (event: MouseEvent) => {
		this.selecting = false;
		if (!this.selectionRect.visible()) return;
		event.preventDefault();

		if (this.mode === 'zoom') {
			if (this.dragSelecting) {
				const box = this.selectionRect.getClientRect();
				const minSize = 15;
				if (box.width > minSize && box.height > minSize) {
					this.zoomToArea(box);
				}
			}
			this.selectionRect.visible(false);
			this.dragSelecting = false;
			return;
		}

		const stageRect = this.stage.container().getBoundingClientRect();
		const scaleX = this.stage.width() / stageRect.width;
		const scaleY = this.stage.height() / stageRect.height;

		const pos = {
			x: (event.clientX - stageRect.left) * scaleX,
			y: (event.clientY - stageRect.top) * scaleY
		};

		this.x2 = (pos.x - this.stage.x()) / this.zoomFactor;
		this.y2 = (pos.y - this.stage.y()) / this.zoomFactor;

		this.selectionRect.setAttrs({
			x: Math.min(this.x1, this.x2),
			y: Math.min(this.y1, this.y2),
			width: Math.abs(this.x2 - this.x1),
			height: Math.abs(this.y2 - this.y1)
		});

		if (this.mode === 'default') {
			this.currentTween = new Konva.Tween({
				node: this.selectionRect,
				duration: 0.1,
				opacity: 0,
				onFinish: () => {
					this.selectionRect.setAttrs({
						visible: false,
						opacity: 1
					});
				}
			}).play();
		}

		const box = this.selectionRect.getClientRect();
		const selected = this.layer
			.getChildren()
			.filter(
				(node) =>
					Konva.Util.haveIntersection(box, node.getClientRect()) &&
					node.visible() &&
					node.draggable() &&
					!this.isGuide(node)
			);

		this.transformer.nodes(selected);
		this.selectedShapes = selected as (Konva.Shape | Konva.Group)[];

		this.update();
	};

	/**
	 * Handle mousemove event
	 * - handles pan
	 * - draws selection rectangle
	 */
	private handleMouseMove = (event: MouseEvent) => {
		if (this.mode === 'pan' || this.panning) return;
		if (!this.selecting) return;

		event.preventDefault();

		const stageRect = this.stage.container().getBoundingClientRect();
		const scaleX = this.stage.width() / stageRect.width;
		const scaleY = this.stage.height() / stageRect.height;

		const pos = {
			x: (event.clientX - stageRect.left) * scaleX,
			y: (event.clientY - stageRect.top) * scaleY
		};

		const currentX = (pos.x - this.stage.x()) / this.zoomFactor;
		const currentY = (pos.y - this.stage.y()) / this.zoomFactor;

		const dx = currentX - this.selectionStartX;
		const dy = currentY - this.selectionStartY;
		const distance = Math.sqrt(dx * dx + dy * dy);

		if (distance > this.selectionThreshold / this.zoomFactor) {
			if (!this.dragSelecting) {
				this.x1 = currentX;
				this.y1 = currentY;
				this.dragSelecting = true;
			}

			this.x2 = currentX;
			this.y2 = currentY;

			this.selectionRect.setAttrs({
				x: Math.min(this.x1, this.x2),
				y: Math.min(this.y1, this.y2),
				width: Math.abs(this.x2 - this.x1),
				height: Math.abs(this.y2 - this.y1),
				visible: true
			});
		}
	};

	/**
	 * Handles shift drag axis lock
	 */
	private handleShiftDragMove = (event: Konva.KonvaEventObject<DragEvent>) => {
		const target = event.target;
		if (!(target instanceof Konva.Shape) && !(target instanceof Konva.Group)) return;

		if (this.shiftPressed) {
			const startPos = target.getAttr('startPos') || { x: target.x(), y: target.y() };

			if (!this.dragDirection) {
				const dx = Math.abs(target.x() - startPos.x);
				const dy = Math.abs(target.y() - startPos.y);
				this.dragDirection = dx > dy ? 'x' : 'y';
			}

			if (this.dragDirection === 'x') {
				target.y(startPos.y);
			} else {
				target.x(startPos.x);
			}
		} else {
			this.dragDirection = undefined;
		}
	};

	/**
	 * Handles alt-duplicate
	 * - original nodes are already being dragged, so move them to top
	 * - keep clones in place, so it looks like the original node is the clone
	 * - keeps the original layer children node order when cloning
	 */
	private setupAltDuplicateEvents() {
		let nodes: (Konva.Shape | Konva.Group)[] = [];
		let clones: (Konva.Shape | Konva.Group)[] = [];
		let duplicating = false;

		this.stage.on('dragstart', (event) => {
			if (!this.altKey || duplicating || event?.target instanceof Konva.Line) return;
			duplicating = true;

			const children = this.layer.getChildren();
			nodes = this.selectedShapes
				.filter((node): node is Konva.Shape | Konva.Group => !this.isGuide(node))
				.sort((a, b) => children.indexOf(a) - children.indexOf(b));

			const nodeOrder = nodes.map((shape) => shape.zIndex());

			clones = nodes
				.map((node) => {
					const clone = node.clone({
						id: this.generateUniqueId(node?.attrs?.type)
					});

					if (clone) {
						this.layer.add(clone);

						if (node instanceof Konva.Image) {
							const image = node.image();

							if (image instanceof HTMLImageElement) {
								clone.image(image);

								if (image instanceof HTMLImageElement && clone.id()) {
									this.updateImageCache(clone.id(), image);
								}
							}
						}
					}
					return clone;
				})
				.filter((clone): clone is Konva.Shape | Konva.Group => clone !== null);

			clones.forEach((clone, index) => {
				clone.zIndex(nodeOrder[index]);
			});

			nodes.forEach((node) => node.moveToTop());
		});

		this.stage.on('dragend', () => {
			if (!duplicating) return;
			duplicating = false;
			nodes = [];
			clones = [];

			this.record();
			this.update();
		});
	}

	/**
	 * Sets up event listener for snap functionality
	 * for when dragging shapes in close proximity to guides
	 */
	private setupGuideSnap() {
		this.layer.on('dragmove', (event) => {
			if (this.isGuide(event.target)) return;

			const nodes = this.selectedShapes.filter(
				(node): node is Konva.Shape | Konva.Group => !this.isGuide(node)
			);

			const box = this.getSnapBoundingBox(nodes);
			const points = this.getSnapPoints(box);

			if (points.length) {
				let offsetX = 0;
				let offsetY = 0;

				points.forEach((point) => {
					if (point.orientation === 'v-guide') {
						switch (point.snap) {
							case 'start':
								offsetX = point.pos - box.x;
								break;
							case 'center':
								offsetX = point.pos - (box.x + box.width / 2);
								break;
							case 'end':
								offsetX = point.pos - (box.x + box.width);
								break;
						}
					} else if (point.orientation === 'h-guide') {
						switch (point.snap) {
							case 'start':
								offsetY = point.pos - box.y;
								break;
							case 'center':
								offsetY = point.pos - (box.y + box.height / 2);
								break;
							case 'end':
								offsetY = point.pos - (box.y + box.height);
								break;
						}
					}
				});

				nodes.forEach((node) => {
					const pos = node.position();
					node.position({
						x: pos.x + offsetX,
						y: pos.y + offsetY
					});
				});
			}
		});
	}

	/**
	 * Calculates bounding box that encloses selected nodes
	 */
	private getSnapBoundingBox(nodes: (Konva.Shape | Konva.Group)[]) {
		const boxes = nodes.map((node) => node.getClientRect({ relativeTo: this.layer }));

		const x = Math.min(...boxes.map((box) => box.x));
		const y = Math.min(...boxes.map((box) => box.y));
		const width = Math.max(...boxes.map((box) => box.x + box.width)) - x;
		const height = Math.max(...boxes.map((box) => box.y + box.height)) - y;

		return {
			x,
			y,
			width,
			height
		};
	}

	/**
	 * Subscribes to $states store
	 * and updates 'state-' nodes
	 */
	subscribeStates() {
		this.unsubscribe = states.subscribe(($states) => {
			if (this.layer && $states) {
				const shapes = this.layer.getChildren(
					(node) => node.getAttr('entity_id') && node?.attrs?.type?.startsWith('state-')
				);
				shapes.forEach((node) => {
					if (!this.transformer.nodes().includes(node)) {
						if (node instanceof Konva.Image) {
							this.updateStateIcon(node, $states);
						} else if (node instanceof Konva.Text) {
							this.updateStateLabel(node, $states);
						}
					}
				});
			}
		});
	}

	/**
	 * Saves history state
	 */
	private record() {
		if (this.applyingState) return;

		const currentState: KonvaHistory = {
			elements: this.layer.children.map((shape) => this.getNodeData(shape)),
			selectedShapes: this.selectedShapes.map((shape) => shape.id())
		};

		const previousState = this.undoStack[this.undoStack.length - 1];

		if (!this.stateEqual(previousState, currentState)) {
			this.undoStack.push(currentState);

			if (this.undoStack.length > this.maxHistory) {
				this.undoStack.shift();
			}

			this.redoStack = [];
		}

		this.update();
	}

	/**
	 * Handle undo
	 */
	public undo() {
		if (this.undoStack.length > 1) {
			const currentState = this.undoStack.pop();
			if (currentState) this.redoStack.push(currentState);

			const previousState = this.undoStack[this.undoStack.length - 1];
			this.applyState(previousState);

			if (previousState.selectedShapes.length === 0) {
				this.restoreSelection(this.selectedShapes.map((shape) => shape.id()));
			}

			this.update();
		}
	}

	/**
	 * Handle redo
	 */
	public redo() {
		if (this.redoStack.length > 0) {
			const previousState = this.redoStack.pop();

			if (previousState) {
				this.undoStack.push(previousState);
				this.applyState(previousState);

				if (previousState.selectedShapes.length === 0) {
					this.restoreSelection(this.selectedShapes.map((shape) => shape.id()));
				}

				this.update();
			}
		}
	}

	/**
	 * Sets state from that point in history
	 */
	private applyState(state: KonvaHistory) {
		this.applyingState = true;

		/**
		 * Handles history state
		 * - remove, updates or add nodes
		 */
		const localHandleState = (layer: Konva.Container, nodes: Konva.Node[]) => {
			layer.children.slice().forEach((node) => {
				const exists = nodes.some((item) => item?.attrs?.id === node.id());
				if (!exists) node.destroy();
			});

			nodes.forEach(async (item, index) => {
				if (!item.attrs?.id) return;

				let node = layer.findOne(`#${item?.attrs?.id}`) as Konva.Shape | Konva.Group;
				if (node) {
					localUpdateNode(node, item?.attrs);
				} else {
					const newNode = await localAddNode(item);
					if (newNode) {
						node = newNode;
						layer.add(node);
					} else {
						console.error(`failed to create node with id ${item?.attrs?.id}`);
						return;
					}
				}

				if (node instanceof Konva.Group && 'children' in item) {
					localHandleState(node, item?.children as Konva.Node[]);
				}

				node.zIndex(index);
			});
		};

		/**
		 * Update node
		 */
		const localUpdateNode = async (node: Konva.Shape | Konva.Group, attrs: ShapeConfig) => {
			const onclick = attrs?.onclick;
			node.setAttr('onclick', onclick ? JSON.parse(JSON.stringify(onclick)) : undefined);

			const type = node?.attrs?.type;

			if (type === 'state-label') {
				node.setAttrs({ ...attrs, text: node.getAttr('text') });
			} else if (type === 'state-icon') {
				node.setAttrs({
					...attrs,
					...{
						image: node.getAttr('image'),
						color: node.getAttr('color'),
						icon: node.getAttr('icon')
					}
				});
			} else if (node instanceof Konva.Image && ['image', 'icon'].includes(type)) {
				const src = node.getAttr('src');
				node.setAttrs(attrs);

				if (attrs?.src !== src) {
					await this.updateImage(node, attrs?.src, false);
					const image = node.image();
					if (image instanceof HTMLImageElement && attrs?.id) {
						this.updateImageCache(attrs?.id, image);
					}
				}
			} else {
				node.setAttrs(attrs);
			}
		};

		/**
		 * Add node
		 */
		const localAddNode = async (nodeData: Konva.Node) => {
			let node: any;

			const attrs = nodeData?.attrs;
			const type = attrs?.type;
			switch (type) {
				case 'state-label':
					node = new Konva.Text(attrs);
					this.updateStateLabel(node, undefined);
					break;
				case 'text':
					node = new Konva.Text(attrs);
					break;
				case 'rectangle':
					node = new Konva.Rect(attrs);
					break;
				case 'circle':
					node = new Konva.Circle(attrs);
					break;
				case 'v-guide':
				case 'h-guide':
					node = new Konva.Line(attrs);
					this.setupGuideEvents(node);
					break;
				case 'group':
					node = new Konva.Group(attrs);
					if (
						nodeData instanceof Konva.Group &&
						nodeData.children &&
						Array.isArray(nodeData.children)
					) {
						nodeData.children.forEach((child: Konva.Shape | Konva.Group) => {
							const childNode = localAddNode(child);
							if (childNode) node.add(childNode);
						});
					}
					break;
				case 'image':
				case 'icon':
				case 'state-icon': {
					node = new Konva.Image(attrs);

					const imageCache = get(konvaImageCache)?.[this?.selId]?.[attrs?.id];
					if (imageCache instanceof HTMLImageElement) {
						node.image(imageCache);
					} else {
						await this.updateImage(node, attrs?.src, false);
						const image = node.image();
						if (image instanceof HTMLImageElement && attrs?.id) {
							this.updateImageCache(attrs?.id, image);
						}
					}

					if (type === 'state-icon') {
						this.updateStateIcon(node as Konva.Image, undefined);
					} else if (type === 'icon') {
						this.updateIcon(node as Konva.Image);
					}

					break;
				}
				default:
					console.error(type, 'type not found');
					node = new Konva.Shape(attrs);
			}

			return node;
		};

		localHandleState(this.layer, state.elements);

		if (state.selectedShapes.length > 0) {
			this.restoreSelection(state.selectedShapes);
		}

		this.updateGuidePos();
		this.applyingState = false;
		this.update();
	}

	/**
	 * Restores transformer nodes on redo/undo
	 */
	private restoreSelection(selectedShapes: string[]) {
		this.selectedShapes = selectedShapes
			.map((id) => this.layer.findOne(`#${id}`))
			.filter(
				(shape): shape is Konva.Shape | Konva.Group =>
					shape instanceof Konva.Shape || shape instanceof Konva.Group
			);

		this.transformer.nodes(this.selectedShapes);
	}

	/**
	 * Helper method to check history state equality
	 * Prevents duplicate entries if mutiple events are fired
	 */
	private stateEqual(state1: KonvaHistory, state2: KonvaHistory) {
		if (!state1) return false;

		if (!this.arraysEqual(state1.selectedShapes, state2.selectedShapes)) return false;
		if (state1.elements.length !== state2.elements.length) return false;

		return state1.elements.every((node1: Konva.Node, index: number) => {
			const node2 = state2.elements[index];
			return this.nodeEqual(node1, node2);
		});
	}

	private arraysEqual(arr1: any[], arr2: any[]) {
		if (arr1.length !== arr2.length) return false;
		return arr1.every((item, index) => item === arr2[index]);
	}

	private nodeEqual(node1: any, node2: any) {
		if (Object.keys(node1).length !== Object.keys(node2).length) return false;

		for (const key in node1) {
			if (key === 'children') {
				if (!Array.isArray(node1[key]) || !Array.isArray(node2[key])) return false;
				if (node1[key].length !== node2[key].length) return false;

				if (
					!node1[key].every((child: any, index: number) => this.nodeEqual(child, node2[key][index]))
				) {
					return false;
				}
			} else if (key === 'attrs') {
				if (!this.attrsEqual(node1[key], node2[key])) return false;
			} else if (node1[key] !== node2[key]) {
				return false;
			}
		}

		return true;
	}

	private attrsEqual(attrs1: any, attrs2: any): boolean {
		const keys1 = Object.keys(attrs1);
		const keys2 = Object.keys(attrs2);

		if (keys1.length !== keys2.length) return false;

		for (const key of keys1) {
			if (key === 'onclick') {
				if (JSON.stringify(attrs1[key]) !== JSON.stringify(attrs2[key])) return false;
			} else if (attrs1[key] !== attrs2[key]) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Duplicate selected shape (with Ctrl+J)
	 */
	public duplicateSelected() {
		if (this.selectedShapes.length === 0) return;

		const clones: (Konva.Shape | Konva.Group)[] = [];
		const layerChildren = this.layer.getChildren();

		const layerOrder = this.selectedShapes.sort(
			(a, b) => layerChildren.indexOf(a) - layerChildren.indexOf(b)
		);

		layerOrder.forEach((node) => {
			const clone = node.clone({
				id: this.generateUniqueId(node?.attrs?.type)
			});

			if (clone instanceof Konva.Image && node instanceof Konva.Image) {
				const image = node.image();
				if (image instanceof HTMLImageElement && clone.id()) {
					clone.image(image);
					this.updateImageCache(clone.id(), image);
				}
			}

			this.layer.add(clone);
			clones.push(clone);
		});

		if (this.selectedShapes.length === 1) {
			clones[0].zIndex(this.selectedShapes[0].zIndex() + 1);
		} else {
			clones.forEach((clone) => clone.moveToTop());
		}

		this.selectedShapes = clones;
		this.transformer.nodes(clones);

		this.record();
		this.update();
	}

	/**
	 * Determines snapping points for the bounding box relative to guide lines
	 */
	private getSnapPoints(box: { x: number; y: number; width: number; height: number }) {
		const points: { pos: number; diff: number; snap: string; orientation: string }[] = [];

		const pos = (start: number, size: number) => [
			{ guide: Math.round(start), snap: 'start' },
			{ guide: Math.round(start + size / 2), snap: 'center' },
			{ guide: Math.round(start + size), snap: 'end' }
		];

		const nodeEdges = {
			vertical: pos(box.x, box.width),
			horizontal: pos(box.y, box.height)
		};

		const offsetX = this.canvas.width() / 2;
		const offsetY = this.canvas.height() / 2;

		this.guides.forEach((node) => {
			if (!node.visible()) return;

			const type = node?.attrs?.type;
			const vertical = type === 'v-guide';
			const edges = vertical ? nodeEdges.vertical : nodeEdges.horizontal;
			const position = vertical ? node.x() + offsetX : node.y() + offsetY;

			edges.forEach((edge) => {
				const diff = Math.abs(position - edge.guide);
				if (diff < this.snapOffset / this.stage.scaleX()) {
					points.push({
						pos: position,
						diff: diff,
						snap: edge.snap,
						orientation: type
					});
				}
			});
		});

		return points;
	}

	/**
	 * Setup special guide events for `v-guide | h-guide`
	 * - handle cursor update
	 * - limit guide x/y position
	 */
	private setupGuideEvents(node: Konva.Line) {
		if (!this.isGuide(node)) return;

		node.on('mouseover dragstart', (event) => {
			if (node.visible() && node.draggable() && !this.selectionRect.isVisible()) {
				this.updateCursor(event);
			}
		});

		node.on('dragmove', () => {
			if (node.attrs.type === 'v-guide') {
				node.y(0);
			} else if (node.attrs.type === 'h-guide') {
				node.x(0);
			}
		});

		node.on('mouseout dragend', (event) => {
			this.updateCursor();
			if (event.type === 'dragend') {
				this.record();
			}
		});
	}

	/**
	 * Updates mouse cursor
	 * - guide
	 * - pan
	 * - zoom
	 * - default
	 */
	public updateCursor(event?: Konva.KonvaEventObject<MouseEvent>) {
		const container = this.stage.container();

		if (event && this.isGuide(event.target)) {
			const type = event.target?.attrs?.type;
			container.style.cursor = type === 'v-guide' ? 'col-resize' : 'row-resize';
			return;
		}

		if (this.mode === 'pan' || this.panning) {
			container.style.cursor = 'grab';
		} else if (this.mode === 'zoom') {
			container.style.cursor = this.altKey ? 'zoom-out' : 'zoom-in';
		} else {
			container.style.cursor = 'default';
		}
	}

	/**
	 * Toggles text box attribute
	 * - adds/removes event listener
	 */
	public toggleTextBox(id: string) {
		const node = this.layer.findOne(`#${id}`);

		if (node instanceof Konva.Text) {
			if (node.getAttr('box')) {
				node.setAttrs({
					box: false,
					width: undefined,
					height: undefined,
					scaleX: 1,
					scaleY: 1
				});

				node.off('transform');
				this.transformer.setAttr('boundBoxFunc', undefined);
			} else if (!node.getAttr('box')) {
				node.setAttrs({
					box: true,
					width: node.width() * node.scaleX(),
					height: node.height() * node.scaleY(),
					scaleX: 1,
					scaleY: 1
				});
				this.addTextBoxEventListener(node);
			}

			this.record();
			this.update();
		}
	}

	/**
	 * Adds shape event listener to set fixed scale on text
	 */
	private addTextBoxEventListener(node: Konva.Text) {
		node.off('transform');

		node.on('transform', () => {
			node.setAttrs({
				width: node.width() * node.scaleX(),
				height: node.height() * node.scaleY(),
				scaleX: 1,
				scaleY: 1
			});
		});
	}

	/**
	 * Fits canvas to stage (double-clicking pan tool)
	 */
	public fitCanvas() {
		const padding = 15;

		const stageWidth = this.stage.width() - padding * 2;
		const stageHeight = this.stage.height() - padding * 2;
		const scale = Math.min(stageWidth / this.canvasWidth, stageHeight / this.canvasHeight);

		const x = (this.stage.width() - this.canvasWidth * scale) / 2 - this.canvas.x() * scale;
		const y = (this.stage.height() - this.canvasHeight * scale) / 2 - this.canvas.y() * scale;

		this.currentTween = new Konva.Tween({
			node: this.stage,
			duration: 0.15,
			easing: Konva.Easings.EaseInOut,
			scaleX: scale,
			scaleY: scale,
			x: x,
			y: y,
			onUpdate: () => {
				this.zoomFactor = this.stage.scaleX();
				this.updateGuidePos();
			},
			onFinish: () => {
				this.currentTween = undefined;
			}
		}).play();
	}

	/**
	 * Move nodes (arrow keys)
	 * - don't record
	 */
	public moveSelectedShapes(x: number, y: number) {
		if (this.mode !== 'default' || this.selectedShapes.length === 0) return;

		this.selectedShapes.forEach((node) => {
			if (node.draggable()) {
				node.position({
					x: node.x() + x,
					y: node.y() + y
				});
			}
		});

		this.update();
	}

	/**
	 * Helper method for `setAttr`
	 */
	public async updateAttr(id: string, key: string, value: any, oninput = false) {
		const node = this.layer.findOne(`#${id}`);
		if (!node) return;

		const attrs = node.attrs;
		const type = attrs?.type;

		switch (true) {
			case key === 'src' && node instanceof Konva.Image:
				await this.updateImage(node, value, true);
				break;

			case key === 'icon' && node instanceof Konva.Image:
				node.setAttr('icon', value);
				await this.updateIcon(node);
				break;

			case type === 'state-icon' && key === 'entity_id' && node instanceof Konva.Image:
				if (value.trim() !== '') {
					node.setAttr('entity_id', value);
					this.updateStateIcon(node, undefined);
				} else {
					node.setAttrs({
						entity_id: '',
						icon: icons['state-icon']
					});

					await this.updateIcon(node);
				}
				break;

			case type === 'state-icon' && key === 'color' && node instanceof Konva.Image:
				node.setAttr('color', value);
				this.updateStateIcon(node, undefined);
				break;

			case type === 'state-label' && key === 'entity_id' && node instanceof Konva.Text:
				node.setAttr('entity_id', value);
				this.updateStateLabel(node, undefined);
				break;

			case type === 'icon' && key === 'color' && node instanceof Konva.Image:
				node.setAttr('color', value);
				this.updateIconColor(node, value);
				break;

			case typeof node.getAttr(key) === 'number': {
				const parsedValue = parseFloat(value);
				if (!isNaN(parsedValue)) {
					if ((key === 'scaleX' || key === 'scaleY') && this.transformer.keepRatio()) {
						node.setAttrs({
							scaleX: parsedValue,
							scaleY: parsedValue
						});
					} else if (key === 'opacity') {
						const opacityRange = Math.max(0, Math.min(100, parsedValue));
						node.setAttr(key, opacityRange / 100);
					} else {
						node.setAttr(key, parsedValue);
					}
				}
				break;
			}

			default:
				node.setAttr(key, value);
				break;
		}

		if (this.transformer && node instanceof Konva.Text) {
			this.transformer.forceUpdate();
		}

		if (!oninput) this.record();

		this.update();
	}

	/**
	 * Handles node visibility
	 */
	public toggleVisibility(id?: string) {
		const nodes = id ? [this.layer.findOne(`#${id}`)] : this.selectedShapes;

		nodes.forEach((node) => {
			if (node) node.visible(!node.visible());
		});

		this.transformer.nodes(
			this.selectedShapes.filter(
				(node) => node.visible() && node.draggable() && !this.isGuide(node)
			)
		);

		this.record();
		this.update();
	}

	/**
	 * Toggles node lock
	 */
	public toggleDraggable(id?: string) {
		const nodes = id ? [this.layer.findOne(`#${id}`)] : this.selectedShapes;

		const validNodes = nodes.filter(
			(shape): shape is Konva.Shape | Konva.Group =>
				shape instanceof Konva.Shape || shape instanceof Konva.Group
		);

		if (validNodes.length) {
			const state = !validNodes[0].draggable();

			validNodes.forEach((node) => {
				node.draggable(state);
				node.listening(state);
			});

			this.transformer.nodes(state ? validNodes.filter((shape) => shape.visible()) : []);

			this.record();
			this.update();
		}
	}

	/**
	 * Toggles shape scale ratio lock
	 */
	public toggleKeepRatio() {
		if (this.transformer) {
			this.transformer.keepRatio(!this.transformer.keepRatio());

			this.update();
		}
	}

	/**
	 * Handle node select in elements panel (outside of canvas)
	 * - handles range select (shift)
	 * - handles multi select (cmd)
	 * - handles default click
	 */
	public handleElementClick(event: MouseEvent, id: string) {
		const { shiftKey, ctrlKey, metaKey } = event;

		if (shiftKey && this.selectedShapes.length > 0) {
			const start = this.layer.findOne(`#${this.selectedShapes[0].id()}`) as Konva.Shape;
			const end = this.layer.findOne(`#${id}`) as Konva.Shape;
			if (!start && !end) return;

			const nodes = this.layer.getChildren().map((node) => node as Konva.Shape);
			const startIndex = nodes.indexOf(start);
			const endIndex = nodes.indexOf(end);

			this.selectedShapes = nodes.slice(
				Math.min(startIndex, endIndex),
				Math.max(startIndex, endIndex) + 1
			);
		} else if (ctrlKey || metaKey) {
			const node = this.layer.findOne(`#${id}`) as Konva.Shape;
			if (!node) return;

			const index = this.selectedShapes.indexOf(node);
			if (index > -1) {
				this.selectedShapes.splice(index, 1);
			} else {
				this.selectedShapes.push(node);
			}
		} else {
			this.selectShapesById([id]);
		}

		this.transformer.nodes(
			this.selectedShapes.filter(
				(node) => node.visible() && node.draggable() && !this.isGuide(node)
			)
		);

		this.update();
	}

	/**
	 * Selects nodes by ids
	 */
	public selectShapesById(ids: string[]) {
		this.selectedShapes = ids
			.map((id) => this.layer.findOne(`#${id}`))
			.filter((node) => node instanceof Konva.Shape || node instanceof Konva.Group);

		this.transformer.nodes(
			this.selectedShapes.filter(
				(node) => node.visible() && node.draggable() && !this.isGuide(node)
			)
		);

		this.update();
	}

	/**
	 * Selects all nodes (Ctrl+A)
	 */
	public selectAll() {
		this.selectedShapes = this.layer.getChildren(
			(node) => node instanceof Konva.Shape || node instanceof Konva.Group
		);

		this.transformer.nodes(
			this.selectedShapes.filter(
				(node) => node.visible() && node.draggable() && !this.isGuide(node)
			)
		);

		this.update();
	}

	/**
	 * Deselects all nodes
	 */
	public deselectAll() {
		this.selectedShapes = [];
		this.transformer.nodes([]);
	}

	/**
	 * Delete selected nodes
	 */
	public deleteSelected() {
		this.selectedShapes.forEach((node) => {
			node.destroy();
		});

		this.deselectAll();
		this.record();
		this.update();
	}

	/**
	 * Reorders nodes with drag and drop
	 */
	public async reorderElements(shapes: string[]) {
		shapes.forEach((id, index) => {
			const node = this.layer.findOne(`#${id}`);
			if (node) node.zIndex(this.layer.children.length - 1 - index);
		});

		await tick();

		this.record();
		this.update();
	}

	/**
	 * Handles rotation snapping
	 */
	public updateRotationSnaps() {
		const snapPoints = [
			0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285,
			300, 315, 330, 345
		];

		this.transformer.rotationSnaps(this.shiftPressed ? snapPoints : []);
	}

	/**
	 * Handles group and ungrouping
	 */
	public handleGroup() {
		if (this.selectedShapes.length > 1) {
			this.group();
		} else if (this.selectedShapes.length === 1 && this.selectedShapes[0] instanceof Konva.Group) {
			this.ungroup();
		}
	}

	/**
	 * Groups nodes
	 */
	private group() {
		const nodes = this.selectedShapes
			.filter((node) => !this.isGuide(node))
			.sort((a, b) => {
				return this.layer.children.indexOf(a) - this.layer.children.indexOf(b);
			});

		if (nodes.length < 2) return;

		const group = new Konva.Group({
			id: this.generateUniqueId('group'),
			type: 'group',
			name: 'Group',
			draggable: true
		});

		let index = Infinity;

		nodes.forEach((node) => {
			index = Math.min(index, this.layer.children.indexOf(node));
			node.setAttr('prevDraggable', node.draggable());
			node.draggable(false);
			node.remove();
			group.add(node);
		});

		this.layer.add(group);
		group.zIndex(index);

		this.selectedShapes = [group];
		this.transformer.nodes([group]);

		this.record();
		this.update();
	}

	/**
	 * Ungroups nodes
	 */
	private ungroup() {
		if (this.selectedShapes.length !== 1 && !(this.selectedShapes[0] instanceof Konva.Group))
			return;

		const selectedShapes: (Konva.Shape | Konva.Group)[] = [];

		const group = this.selectedShapes[0] as Konva.Group;
		const groupIndex = this.layer.children.indexOf(group);

		group
			.getChildren()
			.map((node) => node as Konva.Shape | Konva.Group)
			.forEach((node, index) => {
				node.setAttrs({
					id: this.generateUniqueId(node?.attrs?.type),
					draggable: !!node.getAttr('prevDraggable'),
					prevDraggable: undefined
				});

				this.layer.add(node);
				node.zIndex(groupIndex + index);

				selectedShapes.push(node);
			});

		group.destroy();

		this.selectedShapes = selectedShapes;
		this.transformer.nodes(selectedShapes);

		this.record();
		this.update();
	}

	/**
	 * Set tool mode
	 */
	public setMode(mode: KonvaMode) {
		this.mode = mode;

		if (mode === 'pan') {
			this.startPan();
		} else {
			this.stopPan();
		}

		this.update();
	}

	/**
	 * Starts pan mode (space)
	 */
	public startPan() {
		this.panning = true;
		this.stage.draggable(true);

		this.layer.setAttr('listening', false);
		this.selectionLayer.setAttr('listening', false);

		this.updateCursor();
	}

	/**
	 * Stops pan mode (space release)
	 */
	public stopPan() {
		this.panning = false;
		this.stage.draggable(false);

		this.layer.setAttr('listening', this.mode === 'default');
		this.selectionLayer.setAttr('listening', this.mode === 'default');

		this.updateCursor();
	}

	/**
	 * Handle zoom
	 * - logarithmic scale otherwise it takes forever to zoom with extreme values
	 */
	public setZoom(type: 'in' | 'out' | 'reset', point: { x: number; y: number }) {
		if (this.currentTween) {
			this.currentTween.finish();
			this.currentTween = undefined;
		}

		let scale;

		if (type === 'reset') {
			scale = 1;
		} else {
			const duration = 0.4;
			const zoomFactor = this.zoomFactor * Math.exp(duration * (type === 'in' ? 1 : -1));
			scale = Math.exp(
				Math.min(Math.max(Math.log(zoomFactor), Math.log(this.minZoom)), Math.log(this.maxZoom))
			);
		}

		this.currentTween = new Konva.Tween({
			node: this.stage,
			duration: 0.15,
			easing: Konva.Easings.StrongEaseOut,
			x: point.x - (point.x - this.stage.x()) * (scale / this.zoomFactor),
			y: point.y - (point.y - this.stage.y()) * (scale / this.zoomFactor),
			scaleX: scale,
			scaleY: scale,
			onUpdate: () => {
				this.zoomFactor = this.stage.scaleX();
				this.updateGuidePos();
			},
			onFinish: () => {
				this.currentTween = undefined;
			}
		}).play();
	}

	/**
	 * Zooms to area within selection rectangle
	 */
	private zoomToArea(box: { x: number; y: number; width: number; height: number }) {
		if (this.altKey) return;

		box = {
			x: (box.x - this.stage.x()) / this.zoomFactor,
			y: (box.y - this.stage.y()) / this.zoomFactor,
			width: box.width / this.zoomFactor,
			height: box.height / this.zoomFactor
		};

		const centerX = box.x + box.width / 2;
		const centerY = box.y + box.height / 2;

		const scaleX = this.stage.width() / box.width;
		const scaleY = this.stage.height() / box.height;
		const scale = Math.min(Math.max(Math.min(scaleX, scaleY), this.minZoom), this.maxZoom);

		this.currentTween = new Konva.Tween({
			node: this.stage,
			duration: 0.25,
			easing: Konva.Easings.StrongEaseOut,
			x: this.stage.width() / 2 - centerX * scale,
			y: this.stage.height() / 2 - centerY * scale,
			scaleX: scale,
			scaleY: scale,
			onUpdate: () => {
				this.zoomFactor = this.stage.scaleX();
				this.updateGuidePos();
			},
			onFinish: () => {
				this.currentTween = undefined;
			}
		}).play();
	}

	/**
	 * Add state-label
	 */
	public addStateLabel() {
		const node = new Konva.Text({
			type: 'state-label',
			name: 'State Label',
			entity_id: '',
			fontSize: 60,
			fill: '#ffffff',
			fontStyle: 'normal',
			fontFamily: 'Inter Variable',
			draggable: true
		});

		this.updateStateLabel(node, undefined);

		this.handleAddNode(node);
	}

	/**
	 * Adds state-icon
	 */
	public async addStateIcon() {
		try {
			const icon = icons['state-icon'];
			const color = '#d5d5d5';

			const result = await this.handleSvg(undefined, icon, color);

			if (!result) return;

			const { width, height, url } = result;

			const image = await this.loadImage(url);

			const node = new Konva.Image({
				type: 'state-icon',
				name: 'State Icon',
				entity_id: '',
				icon,
				color,
				image,
				width,
				height,
				draggable: true
			});

			this.handleAddNode(node);
		} catch (err) {
			console.error('error adding state-icon:', err);
		}
	}

	/**
	 * Add text
	 */
	public addText() {
		const node = new Konva.Text({
			type: 'text',
			name: 'Text',
			text: 'Text',
			fontSize: 60,
			fill: '#ffffff',
			fontFamily: 'Inter Variable',
			draggable: true,
			align: 'left'
		});

		this.handleAddNode(node);
	}

	/**
	 * Add icon
	 */
	public async addIcon() {
		try {
			const icon = icons['icon'];
			const color = '#d5d5d5';

			const result = await this.handleSvg(undefined, icon, color);

			if (!result) return;

			const { width, height, url } = result;

			const image = await this.loadImage(url);

			const node = new Konva.Image({
				type: 'icon',
				name: 'Icon',
				icon: icon,
				color: color,
				image: image,
				width: width,
				height: height,
				draggable: true
			});

			this.handleAddNode(node);
		} catch (err) {
			console.error('error adding icon:', err);
		}
	}

	/**
	 * Add image
	 */
	public async addImage() {
		const src = 'https://demo.home-assistant.io/stub_config/t-shirt-promo.png';

		try {
			const image = await this.loadImage(src);

			const node = new Konva.Image({
				type: 'image',
				name: 'Image',
				image: image,
				src: src,
				width: image.naturalWidth || 64,
				height: image.naturalHeight || 64,
				draggable: true
			});

			this.handleAddNode(node);
		} catch (err) {
			console.error('error adding image:', err);

			// add empty fallback
			const node = new Konva.Image({
				type: 'image',
				name: 'Image',
				image: undefined,
				src: src,
				width: 100,
				height: 100,
				draggable: true
			});

			this.handleAddNode(node);

			// gray box onerror
			await this.updateImage(node, src, false);
		}
	}

	/**
	 * Add rectangle
	 */
	public addRectangle() {
		const node = new Konva.Rect({
			type: 'rectangle',
			name: 'Rectangle',
			width: 150,
			height: 80,
			fill: '#ffffff',
			draggable: true
		});

		this.handleAddNode(node);
	}

	/**
	 * Add circle
	 */
	public addCircle() {
		const node = new Konva.Circle({
			type: 'circle',
			name: 'Circle',
			radius: 50,
			fill: '#ffffff',
			draggable: true
		});

		this.handleAddNode(node);
	}

	/**
	 * Add v-guide
	 */
	public addVerticalGuide() {
		const stageHeight = this.stage.height();
		const centerX = this.canvasWidth / 2;
		const topY = -(stageHeight - this.canvasHeight) / 2;
		const bottomY = stageHeight / 2 + this.canvasHeight / 2;

		const node = new Konva.Line({
			type: 'v-guide',
			points: [centerX, topY, centerX, bottomY],
			stroke: '#75fcfd',
			name: 'Vertical Guide',
			strokeWidth: 1,
			hitStrokeWidth: 8,
			draggable: true,
			strokeScaleEnabled: false
		});

		this.handleAddNode(node);
	}

	/**
	 * Add h-guide
	 */
	public addHorizontalGuide() {
		const stageWidth = this.stage.width();
		const centerY = this.canvasHeight / 2;
		const leftX = -(stageWidth - this.canvasWidth) / 2;
		const rightX = stageWidth / 2 + this.canvasWidth / 2;

		const node = new Konva.Line({
			type: 'h-guide',
			points: [leftX, centerY, rightX, centerY],
			stroke: '#75fcfd',
			name: 'Horizontal Guide',
			strokeWidth: 1,
			hitStrokeWidth: 8,
			draggable: true,
			strokeScaleEnabled: false
		});

		this.handleAddNode(node);
	}

	/**
	 * Handle add node
	 */
	private handleAddNode(node: Konva.Shape) {
		const type = node?.attrs?.type;

		node.setAttrs({
			id: this.generateUniqueId(type)
		});

		if (node instanceof Konva.Circle)
			node.position({
				x: this.canvasWidth / 2,
				y: this.canvasHeight / 2
			});
		else if (!this.isGuide(node)) {
			node.position({
				x: (this.canvasWidth - node.width()) / 2,
				y: (this.canvasHeight - node.height()) / 2
			});
		}

		if (type === 'image' && node instanceof Konva.Image) {
			this.fitImage(node);
		}

		this.layer.add(node);

		if (this.isGuide(node) && node instanceof Konva.Line) {
			this.setupGuideEvents(node);
			this.updateGuidePos();
		} else {
			this.selectedShapes = [node];
			this.transformer.nodes([node]);
		}

		this.record();
		this.update();
	}

	/**
	 * onDestroy helper to record data
	 */
	public getElementsData() {
		return this.layer.getChildren().map((node) => this.getNodeData(node));
	}

	/**
	 * Get node
	 * - removes image attribute because it can't be serialized
	 * - removes state-icon color
	 * - handles nested group nodes
	 */
	private getNodeData(node: Konva.Node) {
		const attrs = this.getShapeAttrs(node);

		delete attrs.image;
		if (attrs.type === 'state-icon') delete attrs.state_color;

		const data: any = {
			attrs,
			className: node.getClassName()
		};

		if (node instanceof Konva.Group) {
			data.children = node.getChildren().map((child) => this.getNodeData(child));
		}

		return data;
	}

	private generateUniqueId(type: string) {
		const timestamp = Date.now();
		const randomPart = Math.random().toString(36).slice(2, 11);
		return `${type}-${timestamp}-${randomPart}`;
	}

	/**
	 * Destroy editor
	 */
	public destroyEditor() {
		window.removeEventListener('mousemove', this.handleMouseMove);
		window.removeEventListener('mouseup', this.handleMouseup);
		this.unsubscribe?.();
		super.destroyBase();
	}
}
