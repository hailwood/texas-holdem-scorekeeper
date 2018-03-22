import chalk from 'chalk';

export const formatName = (message: string) => chalk.cyan(message);

export const formatRank = (message: string) => chalk.bold(message);

export const formatPrompt = (message: string) => chalk.bold(`${message}\n`);

export const formatError = (message: string) => chalk.bgRed.white(message);