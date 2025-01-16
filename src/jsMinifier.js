import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { minify_sync } from 'terser';

const currentDirectory = process.cwd();
const jsDirectory = path.join(currentDirectory, 'js');
const distDirectory = path.join(currentDirectory, 'dist');

export function minifyJS(minJsFileName) {
	if (!fs.existsSync(jsDirectory)) {
		console.log(chalk.yellow("- js folder not found -"));
		return;
	}

	const jsFiles = fs.readdirSync(jsDirectory);
	if (jsFiles.length === 0) {
		console.log(chalk.yellow("- There is no .js file in the js folder. -"));
		return;
	}

	if (!fs.existsSync(distDirectory)) fs.mkdirSync(distDirectory);

	const files = {};
	const minJsFileNameMap = `${minJsFileName}.map`;

	jsFiles.forEach((file) => {
		if (!file.endsWith('.js')) return;

		const filePath = path.normalize(path.join(jsDirectory, file));
		const fileContent = fs.readFileSync(filePath, 'utf-8');
		files[file] = fileContent;
	});

	const result = minify_sync(files, {
		compress: true,
		mangle: true,
		toplevel: true,
		sourceMap: {
			url: minJsFileNameMap,
			filename: minJsFileName,
			root: "/js/",
			includeSources: true
		}
	});

	fs.writeFileSync(path.join(distDirectory, minJsFileName), result.code);
	fs.writeFileSync(path.join(distDirectory, minJsFileNameMap), result.map);

	console.log(chalk.green(`[${Object.keys(files).join(', ')}] --> ${minJsFileName}, ${minJsFileNameMap}`));
}
