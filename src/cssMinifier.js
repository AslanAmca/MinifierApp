import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import CleanCSS from "clean-css";

const currentDirectory = process.cwd();
const cssDirectory = path.join(currentDirectory, 'css');
const distDirectory = path.join(currentDirectory, 'dist');

export function minifyCSS(minCssFileName) {
	if (!fs.existsSync(cssDirectory)) {
		console.log(chalk.yellow("- css folder not found -"));
		return;
	}

	const cssFiles = fs.readdirSync(cssDirectory);
	if (cssFiles.length === 0) {
		console.log(chalk.yellow("- There is no .css file in the css folder. -"));
		return;
	}

	if (!fs.existsSync(distDirectory)) fs.mkdirSync(distDirectory);

	const files = [];
	const minCssFileNameMap = `${minCssFileName}.map`;

	cssFiles.forEach((file) => {
		if (!file.endsWith('.css')) return;

		const filePath = path.normalize(path.join(cssDirectory, file));
		files.push(filePath);
	});

	const result = new CleanCSS({
		sourceMap: true,
		sourceMapInlineSources: true,
		level: 2
	}).minify(files);

	const sourceMap = JSON.parse(result.sourceMap);
	const minCssMap = {
		version: sourceMap.version,
		file: minCssFileName,
		names: sourceMap.names,
		sourceRoot: "/css/",
		sources: sourceMap.sources.map(source => path.basename(source)),
		sourcesContent: sourceMap.sourcesContent,
		mappings: sourceMap.mappings,
		ignoreList: []
	};

	const minCss = `${result.styles}\n/*# sourceMappingURL=${minCssFileNameMap} */`;

	fs.writeFileSync(path.join(distDirectory, minCssFileName), minCss);
	fs.writeFileSync(path.join(distDirectory, minCssFileNameMap), JSON.stringify(minCssMap));

	console.log(chalk.green(`[${minCssMap.sources.join(', ')}] --> ${minCssFileName}, ${minCssFileNameMap}`));
}
