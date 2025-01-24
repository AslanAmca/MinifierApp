import path from 'path';
import chalk from 'chalk';
import { select, input, confirm } from '@inquirer/prompts';
import { minifyCSS } from './cssMinifier.js';
import { minifyJS } from './jsMinifier.js';


// Geçerli dosya adı validasyonu
function validateFilename(value, fileType) {
	const invalidCharsAndWhitespace = /[<>:"/\\|?*\s\t\n\r]/;
	value = value.trim();

	if (!value)
		return "Filename cannot be empty.";

	if (value.length > 255)
		return "Filename cannot be longer than 255 characters.";

	if (invalidCharsAndWhitespace.test(value))
		return "Filename cannot contain forbidden characters: < > : \” / \\ | ? * space, tab, newline, etc.";

	const extname = path.extname(value);

	if (extname && extname !== `.${fileType}`)
		return `Filename must be extensionless or have the same extension (.${fileType}) as the file type.`;

	return true;
}

async function getFilename(fileType) {
	const filename = await input({
		message: `Enter the minified file name that will be generated for ${fileType.toUpperCase()}:`,
		validate: (value) => validateFilename(value, fileType)
	});

	if (filename.endsWith(`.min.${fileType}`))
		return filename;

	if (filename.endsWith(`.${fileType}`))
		return filename.replace(`.${fileType}`, `.min.${fileType}`);

	return `${filename}.min.${fileType}`;
}

async function main() {
	console.log(chalk.bold.magenta("- Welcome the MinifierApp -"));

	while (true) {
		try {
			const choice = await select({
				message: "Select the operation",
				choices: [
					{ name: "1- Minify only CSS files", value: "css" },
					{ name: "2- Minify only JS files", value: "js" },
					{ name: "3- Minify both of them (CSS + JS)", value: "both" },
					{ name: "4- Exit the program", value: "exit" }
				],
			});

			if (choice === "css" || choice === "both") {
				const cssFilename = await getFilename("css");
				minifyCSS(cssFilename);
			}

			if (choice === "js" || choice === "both") {
				const jsFilename = await getFilename("js");
				minifyJS(jsFilename);
			}

			if (choice === "exit" || !await confirm({ message: "Would you like to select another operation?", default: false }))
				break;

		} catch ({ name, message }) {
			if (name === "ExitPromptError")
				console.log(chalk.bold.magenta(`- Program was ${chalk.underline("forcibly")} terminated by the user. -`));
			else
				console.error(chalk.red(`An unexpected error has occurred: ${message}`));
			process.exit(1);
		}
	}

	console.log(chalk.bold.magenta("- Program ended -"));
}

main()