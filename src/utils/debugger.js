import chalk from 'chalk';

const debugMorgan =(tokens, req, res) => {
        const method = tokens.method(req, res);
        const url = tokens.url(req, res);
        const status = tokens.status(req, res);
        const responseTime = tokens['response-time'](req, res);
        const body = tokens.body(req, res);
        const ip = tokens['remote-addr'](req, res);
        const userAgent = tokens['user-agent'](req, res);
        const referrer = tokens.referrer(req, res) || 'direct';
 
        const methodColored = chalk.bold.blue(method);
        const urlColored = chalk.white(url);
       
        let statusColored;
        if (status >= 500) {
            statusColored = chalk.bold.red(status);
        } else if (status >= 400) {
            statusColored = chalk.bold.yellow(status);
        } else if (status >= 300) {
            statusColored = chalk.bold.cyan(status);
        } else {
            statusColored = chalk.bold.green(status);
        }
 
        const responseTimeColored = chalk.magenta(`${responseTime} ms`);
       
        let logString = `\n${chalk.bold.yellow('▶')} ${methodColored} ${urlColored} ${statusColored} - ${responseTimeColored}`;
        logString += `\n  ${chalk.cyan('From:')} ${chalk.yellow(ip)}`;
        logString += `\n  ${chalk.cyan('Agent:')} ${chalk.white(userAgent)}`;
        logString += `\n  ${chalk.cyan('Referrer:')} ${chalk.white(referrer)}`;
 
 
        if (body !== '{}') {
            logString += `\n  ${chalk.gray('Body:')} ${chalk.gray(body)}`;
        }
 
        return logString;
}


export { debugMorgan };