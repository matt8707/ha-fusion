/**
 * There is no way to know which fonts are installed on the client...
 * This compares the width of commonly installed fonts against a baseline
 */
export async function getFontList(): Promise<string[]> {
	await document.fonts.ready;

	const canvas =
		typeof OffscreenCanvas !== 'undefined'
			? new OffscreenCanvas(0, 0)
			: document.createElement('canvas');

	const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
	if (!ctx) return [];

	const test = 'abcdefghijklmnopqrstuvwxyz0123456789';
	ctx.font = '12px monospace';
	const baseline = ctx.measureText(test).width;

	return fonts.filter((font) => {
		ctx.font = `12px "${font}", monospace`;
		return ctx.measureText(test).width !== baseline;
	});
}

/**
 * Common fonts that might be available
 */
const fonts = [
	'American Typewriter',
	'Andale Mono',
	'Arial',
	'Arial Black',
	'Arial Narrow',
	'Arial Rounded MT Bold',
	'Arial Unicode MS',
	'Avenir',
	'Avenir Next',
	'Avenir Next Condensed',
	'Bahnschrift',
	'Baskerville',
	'Big Caslon',
	'Bodoni 72',
	'Bodoni 72 Oldstyle',
	'Bodoni 72 Smallcaps',
	'Bradley Hand',
	'Brush Script MT',
	'Calibri',
	'Cambria',
	'Cambria Math',
	'Candara',
	'Chalkboard',
	'Chalkboard SE',
	'Chalkduster',
	'Charter',
	'Cochin',
	'Comic Sans MS',
	'Consolas',
	'Constantia',
	'Copperplate',
	'Corbel',
	'Courier',
	'Courier New',
	'DIN Alternate',
	'DIN Condensed',
	'Didot',
	'Ebrima',
	'Franklin Gothic Medium',
	'Futura',
	'Gabriola',
	'Gadugi',
	'Geneva',
	'Georgia',
	'Gill Sans',
	'Helvetica',
	'Helvetica Neue',
	'Herculanum',
	'Hoefler Text',
	'HoloLens MDL2 Assets',
	'Impact',
	'Ink Free',
	'Inter Variable',
	'Javanese Text',
	'Leelawadee UI',
	'Lucida Console',
	'Lucida Grande',
	'Lucida Sans Unicode',
	'Luminari',
	'MS Gothic',
	'MV Boli',
	'Malgun Gothic',
	'Marker Felt',
	'Marlett',
	'Menlo',
	'Microsoft Himalaya',
	'Microsoft JhengHei',
	'Microsoft New Tai Lue',
	'Microsoft PhagsPa',
	'Microsoft Sans Serif',
	'Microsoft Tai Le',
	'Microsoft YaHei',
	'Microsoft Yi Baiti',
	'MingLiU-ExtB',
	'Monaco',
	'Mongolian Baiti',
	'Myanmar Text',
	'Nirmala UI',
	'Noteworthy',
	'Optima',
	'Palatino',
	'Palatino Linotype',
	'Papyrus',
	'Phosphate',
	'Rockwell',
	'Savoye LET',
	'Segoe MDL2 Assets',
	'Segoe Print',
	'Segoe Script',
	'Segoe UI',
	'Segoe UI Emoji',
	'Segoe UI Historic',
	'Segoe UI Symbol',
	'SignPainter',
	'SimSun',
	'Sitka',
	'Skia',
	'Snell Roundhand',
	'Symbol',
	'Sylfaen',
	'Tahoma',
	'Times',
	'Times New Roman',
	'Trattatello',
	'Trebuchet MS',
	'Verdana',
	'Webdings',
	'Wingdings',
	'Yu Gothic',
	'Zapfino'
];
