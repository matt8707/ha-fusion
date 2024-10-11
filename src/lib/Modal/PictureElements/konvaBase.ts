import Konva from 'konva';
import { get, type Unsubscriber } from 'svelte/store';
import { konvaImageCache, states } from '$lib/Stores';
import type { HassEntities } from 'home-assistant-js-websocket';
import { getIcon, iconExists, loadIcon, type IconifyIcon } from '@iconify/svelte';
import type { ContainerConfig } from 'konva/lib/Container';
import { icons } from '$lib/Modal/PictureElements/icons';
import { computeIcon } from './computeIcon';

/**
 * Shared methods for `KonvaViewer` and `KonvaEditor`
 */
export class KonvaBase {
	public stage: Konva.Stage;
	public layer: Konva.Layer;

	// svg parser
	private parser = new DOMParser();
	private serializer = new XMLSerializer();

	// states store
	protected unsubscribe: Unsubscriber | undefined;

	private defaultIconColor = '#d5d5d5';

	// instance id
	protected selId: string;

	// browser zoom pixel ratio
	private devicePixelRatio = window.devicePixelRatio || 1;
	private visualViewportScale = visualViewport?.scale || 1;
	private debounceFunction: (event: Event) => void;

	constructor(container: HTMLDivElement, data: ContainerConfig) {
		const stageData = JSON.stringify(data);
		this.stage = Konva.Node.create(stageData, container);
		this.layer = this.stage.findOne('Layer') as Konva.Layer;
		this.selId = data?.attrs?.id;

		if (this.devicePixelRatio && this.visualViewportScale) {
			const canvas = this.layer.getCanvas();
			canvas.setPixelRatio(this.devicePixelRatio * this.visualViewportScale);
		}

		this.debounceFunction = this.debounce(this.handleScaleChange, 50);
		visualViewport?.addEventListener('resize', this.debounceFunction);
		window.addEventListener('resize', this.handleZoomChange);
	}

	/**
	 * Can be overridden in `KonvaEditor`
	 */
	protected updateCallback() {
		// this.update();
	}

	/**
	 * Helper to check for `Konva.Line` guides
	 */
	protected isGuide(node: Konva.Node): boolean {
		return node?.attrs?.type?.includes('-guide');
	}

	/**
	 * Handles updating `state-icon`
	 * - sets default icon if `entity_id` is missing
	 * - updates `icon` if it doesn't match previous icon
	 * - updates icon `state_color` if icon matches but not color
	 */
	protected async updateStateIcon(node: Konva.Image, $states: HassEntities | undefined) {
		const entity_id = node.getAttr('entity_id');

		if (!entity_id) {
			node.setAttr('icon', icons['state-icon']);
			node.setAttr('state_color', undefined);
			this.updateIcon(node);
			return;
		}

		if (!$states) $states = get(states);

		const nodeIcon = node.getAttr('icon');
		const nodeColor = node.getAttr('color');
		const nodeStateColor = node.getAttr('state_color');

		const computedIcon = computeIcon(entity_id, $states);
		const entityAttrs = $states?.[entity_id]?.attributes;
		const computedStateColor = entityAttrs?.hs_color
			? `hsl(${entityAttrs?.hs_color}%, 50%)`
			: undefined;

		node.setAttrs({
			icon: computedIcon,
			color: nodeColor,
			state_color: computedStateColor
		});

		if (computedIcon && computedIcon !== nodeIcon) {
			node.setAttrs({
				icon: computedIcon,
				color: nodeColor,
				state_color: computedStateColor
			});
			await this.updateIcon(node);
		} else if (computedStateColor && computedStateColor !== nodeStateColor) {
			node.setAttr('state_color', computedStateColor);
			this.updateIconColor(node, computedStateColor);
		} else if (!computedStateColor) {
			this.updateIconColor(node, nodeColor);
		}
	}

	/**
	 * Handles updating `state-label`
	 * - Updates `text` if it doesn't match previous text
	 * - Sets text to 'unknown' if it can't update
	 */
	protected updateStateLabel(node: Konva.Text, $states: HassEntities | undefined) {
		const unknownState = 'unknown';
		const entity_id = node.getAttr('entity_id');

		if (!entity_id || entity_id?.trim() === '') {
			if (node.text() !== unknownState) {
				node.text(unknownState);
			}
			return;
		}

		if (!$states) $states = get(states);

		const entity = $states?.[entity_id];
		const entityState = entity?.state;

		if (entityState) {
			if (node.text() !== entityState) node.text(entityState);
		} else {
			if (node.text() !== unknownState) node.text(unknownState);
		}
	}

	/**
	 * Update image
	 * - Sets gray placeholder on error
	 */
	protected async updateImage(node: Konva.Image, src: string, fitImage: boolean) {
		return new Promise<void>((resolve) => {
			const image = new Image();

			image.onload = () => {
				node.image(image);
				node.width(image.naturalWidth);
				node.height(image.naturalHeight);

				if (fitImage) this.fitImage(node);
				this.updateCallback();
				resolve();
			};

			image.onerror = () => {
				const canvas = document.createElement('canvas');
				canvas.width = node.width() || 100;
				canvas.height = node.height() || 100;

				const ctx = canvas.getContext('2d');
				if (ctx) {
					ctx.fillStyle = 'gray';
					ctx.fillRect(0, 0, canvas.width, canvas.height);
				}

				node.image(canvas);
				resolve();
			};

			node.setAttr('src', src);
			image.src = src;
		});
	}

	/**
	 * Fits image to canvas
	 * - canvas reference is defined in editor
	 */
	protected fitImage(node: Konva.Image) {
		const canvasLayer = this.stage.findOne('Layer') as Konva.Layer;
		const canvas = canvasLayer.findOne('Rect') as Konva.Rect;

		const padding = 15;

		const centerX = canvas.x() + canvas.width() / 2;
		const centerY = canvas.y() + canvas.height() / 2;

		const maxWidth = canvas.width() - padding * 2;
		const maxHeight = canvas.height() - padding * 2;
		const scale = Math.min(1, maxWidth / node.width(), maxHeight / node.height());

		node.setAttrs({
			x: centerX - (node.width() * scale) / 2,
			y: centerY - (node.height() * scale) / 2,
			scaleX: scale,
			scaleY: scale
		});

		node.move({
			x: -this.layer.x(),
			y: -this.layer.y()
		});
	}

	/**
	 * Helper method to load image
	 */
	protected async loadImage(src: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const image = new Image();
			image.onload = () => resolve(image);
			image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
			image.src = src;
		});
	}

	/**
	 * Handles $konvaImageCache store
	 *
	 * Stores images by id so it can be passed
	 * to KonvaEditor without refetching images
	 */
	protected updateImageCache(id: string, image: HTMLImageElement) {
		konvaImageCache.update((cache) => {
			if (!cache[this.selId]) cache[this.selId] = {};
			cache[this.selId][id] = image;
			return cache;
		});
	}

	/**
	 * Updates icon
	 * - Loads new icon from `handleSvg` data
	 * - Adds it to `$konvaImageCache`
	 * - Update callback for `KonvaEditor`
	 */
	protected async updateIcon(node: Konva.Image) {
		if (!node.getAttr('icon')) return;

		const result = await this.handleSvg(node, undefined);
		if (!result) return;
		const { width, height, url } = result;

		return new Promise<void>((resolve, reject) => {
			const image = new Image();

			image.onload = () => {
				node.image(image);
				node.setAttrs({ width, height });
				if (node.getAttr('id')) {
					this.updateImageCache(node.getAttr('id'), image);
				}
				this.updateCallback();
				resolve();
			};

			image.onerror = (err) => reject(err);
			image.src = url;
		});
	}

	/**
	 * Sets icon color by decoding svg
	 * uri without fetching icon again
	 */
	protected updateIconColor(node: Konva.Image, color: string) {
		const image = node.getAttr('image') as HTMLImageElement;
		if (!image) return;

		const parts = image.src.split(',');
		const decoded = decodeURIComponent(parts[1]);
		const parsed = this.parser.parseFromString(decoded, 'image/svg+xml');
		const svg = parsed.documentElement;

		svg.style.color = color;

		const svgString = this.serializer.serializeToString(svg);
		image.src = 'data:image/svg+xml,' + encodeURIComponent(svgString);

		this.updateCallback();
	}

	/**
	 * Loads iconify data and returns an svg encoded uri
	 * - handles either a `node` or string like 'mdi:dog'
	 * - fetches new icon using iconify api
	 * - handles aspect ratio for non-uniform icons like 'fa6-solid:arrow-down-long'
	 */
	protected async handleSvg(
		node: Konva.Image | undefined,
		icon: string | undefined,
		color?: string
	): Promise<{
		url: string;
		width: number;
		height: number;
		color: string;
	} | void> {
		icon = icon || node?.getAttr('icon');

		if (!icon) {
			console.error('no icon specified');
			return;
		}

		let data: IconifyIcon;

		try {
			if (iconExists(icon)) {
				const existingIcon = getIcon(icon);
				if (existingIcon) {
					data = existingIcon;
				} else {
					data = await loadIcon(icon);
				}
			} else {
				data = await loadIcon(icon);
			}
		} catch {
			data = await loadIcon('mdi:image-broken');
		}

		const defaultSize = 64;
		const iconWidth = data?.width || defaultSize;
		const iconHeight = data?.height || defaultSize;
		const iconColor = color || node?.getAttr('state_color') || node?.getAttr('color');

		const scalingFactor = defaultSize / Math.max(iconWidth, iconHeight);
		const maxWidth = Math.round(iconWidth * scalingFactor);
		const maxHeight = Math.round(iconHeight * scalingFactor);

		const offsetX = (defaultSize - maxWidth) / 2;
		const offsetY = (defaultSize - maxHeight) / 2;
		const scale = `${maxWidth / iconWidth}, ${maxHeight / iconHeight}`;

		const svg = `
			<svg xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 ${defaultSize} ${defaultSize}"
				width="${defaultSize}"
				height="${defaultSize}"
				preserveAspectRatio="none"
				style="color: ${iconColor};"
			>
				<g transform="translate(${offsetX}, ${offsetY}) scale(${scale})">
					${data?.body || ''}
				</g>
			</svg>
		`;

		return {
			url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
			width: node?.getAttr('width') || defaultSize,
			height: node?.getAttr('height') || defaultSize,
			color: iconColor
		};
	}

	/**
	 * Explicitly get shape attributes, because
	 * Konva doesn't include default values with `toJSON()` ...
	 */
	protected getShapeAttrs(node: Konva.Node) {
		const type = node?.attrs?.type;

		let attrs: Record<string, any> = {
			id: node.id(),
			type: node?.attrs?.type,
			name: node.name(),
			x: node.x(),
			y: node.y(),
			width: node.width(),
			height: node.height(),
			scaleX: node.scaleX(),
			scaleY: node.scaleY(),
			rotation: node.rotation(),
			opacity: node.opacity(),
			draggable: node.draggable(),
			listening: node.listening(),
			visible: node.visible(),
			prevDraggable: node?.getAttr('prevDraggable')
		};

		const onclick = node.getAttr('onclick');
		if (onclick) attrs.onclick = JSON.parse(JSON.stringify(onclick));

		if (node instanceof Konva.Image) {
			if (type === 'image') {
				attrs = {
					...attrs,
					image: node.image(),
					src: node.getAttr('src')
				};
			} else if (type === 'icon') {
				attrs = {
					...attrs,
					image: node.image(),
					icon: node.getAttr('icon'),
					color: node.getAttr('color')
				};
			} else if (type === 'state-icon') {
				attrs = {
					...attrs,
					entity_id: node.getAttr('entity_id'),
					state_color: node.getAttr('state_color'),
					color: node.getAttr('color')
				};
			}
		} else if (node instanceof Konva.Text) {
			attrs = {
				...attrs,
				box: !!node?.getAttr('box'),
				fill: node.fill(),
				fontFamily: node.fontFamily(),
				fontSize: node.fontSize(),
				letterSpacing: node.letterSpacing(),
				lineHeight: node.lineHeight(),
				fontStyle: node.fontStyle(),
				align: node.align(),
				ellipsis: node.ellipsis()
			};

			if (!node.getAttr('box')) {
				attrs.width = undefined;
				attrs.height = undefined;
			}

			if (type === 'state-label') {
				attrs.entity_id = node.getAttr('entity_id');
			} else if (type !== 'state-label') {
				attrs.text = node.text();
			}
		} else if (node instanceof Konva.Rect) {
			attrs = {
				...attrs,
				fill: node.fill(),
				cornerRadius: node.cornerRadius()
			};
		} else if (node instanceof Konva.Circle) {
			attrs = {
				...attrs,
				fill: node.fill(),
				radius: node.radius()
			};
		} else if (node instanceof Konva.Line) {
			attrs = {
				...attrs,
				points: node.points(),
				stroke: node.stroke(),
				strokeWidth: node.strokeWidth(),
				hitStrokeWidth: node.hitStrokeWidth(),
				strokeScaleEnabled: node.strokeScaleEnabled()
			};
		}

		return attrs;
	}

	/**
	 * Debounce method for `handleScaleChange()`
	 */
	private debounce(func: (event: Event) => void, wait: number) {
		let timeout: ReturnType<typeof setTimeout>;
		return (event: Event) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => func(event), wait);
		};
	}

	/**
	 * Handles canvas pixel ratio on viewport scale (smart zoom)
	 * by multiplying devicePixelRatio with visualViewport scale
	 */
	private handleScaleChange = (event: Event) => {
		const visualViewport = event.target as VisualViewport;
		const current = visualViewport?.scale;
		if (this.visualViewportScale !== current) {
			this.stage.getLayers().forEach((layer) => {
				if (this.devicePixelRatio && current) {
					layer.getCanvas().setPixelRatio(this.devicePixelRatio * current);
				}
			});
			this.stage.batchDraw();
			this.visualViewportScale = current;
		}
	};

	/**
	 * Handles canvas pixel ratio on browser zoom (cmd +/-)
	 * by directly applying devicePixelRatio to layers
	 */
	private handleZoomChange = () => {
		const current = window.devicePixelRatio;
		if (current && this.devicePixelRatio !== current) {
			this.stage.getLayers().forEach((layer) => {
				layer.getCanvas().setPixelRatio(current);
			});
			this.stage.batchDraw();
			this.devicePixelRatio = current;
		}
	};

	/**
	 * Destroy konva
	 */
	protected destroyBase() {
		if (visualViewport) {
			visualViewport.removeEventListener('resize', this.debounceFunction);
		}
		window.removeEventListener('resize', this.handleZoomChange);
		this.stage.destroy();
	}
}
