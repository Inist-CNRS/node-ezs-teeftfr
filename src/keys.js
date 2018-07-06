import core from './core';
/**
 * Take `Object` and throws all its keys
 *
 * @param {String} path
 * @returns {Object}
 */
export default function keys(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    Object.keys(data)
        .forEach(item => feed.write(core(item, 1)));
    feed.end();
}
