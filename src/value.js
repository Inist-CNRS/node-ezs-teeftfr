import get from 'lodash.get';

/**
 * Take `Object` object and getting the value field
 *
 * @param {String} [path=value] the pah of the value field
 * @returns {Object}
 */
export default function value(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const path = this.getParam('path', 'value');
    const fields = Array.isArray(path) ? path : [path];

    const val = fields
        .filter(k => typeof k === 'string')
        .map(key => get(data, key))
        .filter(x => x)
        [0];
    feed.send(val);
}
