/*
 * Check that a `text` begins with any of the `tags`.
 *
 * @param {Array<string>} tags
 * @param {string} text
 * @returns {Boolean}
 */
export function beginsWith(tags, text) {
    return tags.some(tag => text.startsWith(tag));
}

/*
 * Check if some of the `texts` begins with any of the `tags`.
 *
 * Returns true if texts is not defined (when a term is not tagged, for example
 * a multiterm)
 *
 * @param {Array<string>} tags @param {Array<string>} texts @returns {Boolean}
 */
export function someBeginsWith(tags, texts) {
    if (!texts) return true;
    return texts.some(text => beginsWith(tags, text));
}

/**
 * Filter the text in input, by keeping only adjectives and names
 *
 * @export
 * @param {Stream} data
 * @param {Array<Object>} feed
 * @param {string} [tags=['ADJ', 'NOM']]  Tags to keep
 */
export default function TEEFTFilterTags(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const tagsToKeep = this.getParam('tags', ['ADJ', 'NOM']);
    const dataArray = Array.isArray(data) ? data : [data];
    const res = dataArray
        .filter(w => someBeginsWith(tagsToKeep, w.tag));
    feed.write(res);
    feed.end();
}
