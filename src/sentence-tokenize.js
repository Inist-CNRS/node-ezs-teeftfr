const sentencesCutter = (input) => {
    if (!input || input.trim() === '') {
        return [];
    }
    const regex = /(["'‘“'"[({⟨][^.?!]+[.?!]["'’”'"\])}⟩]|[^.?!]+[.?!\s]+)\s?/g;
    const tokens = input.match(regex);

    if (!tokens) {
        return [input];
    }
    // remove unecessary white space

    return tokens.filter(Boolean).map(s => s.trim());
};

function TEEFTSentenceTokenize(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const docsIn = Array.isArray(data) ? data : [data];
    const docsOut = docsIn.map(doc => ({
        path: doc.path,
        sentences: sentencesCutter(doc.content),
    }));
    feed.write(docsOut);
    feed.end();
}

/**
 * Segment the data into an array of documents (objects { path, content }).
 *
 * Yield an array of documents (objects { path, sentences: []})
 *
 * @export
 * @name TEEFTSentenceTokenize
 */
export default {
    TEEFTSentenceTokenize,
};
