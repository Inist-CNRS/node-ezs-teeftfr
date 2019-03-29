const assert = require('assert');
const from = require('from');
const ezs = require('ezs');
const { reinitSequenceFrequency, extractSentenceTerms } = require('../lib/extract-terms');

ezs.use(require('../lib'));

describe('tokenize', () => {
    it('should split ascii simple words', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            sentences: ['aha blabla hehe'],
        }])
            .pipe(ezs('TEEFTTokenize'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                assert.equal(res[0].sentences.length, 1);
                const firstSentence = res[0].sentences[0];
                assert(Array.isArray(firstSentence));
                assert.equal(firstSentence.length, 3);
                assert.equal(firstSentence[0], 'aha');
                assert.equal(firstSentence[1], 'blabla');
                assert.equal(firstSentence[2], 'hehe');
                done();
            });
    });

    it('should split french simple words', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            sentences: ['ça va héhé'],
        }])
            .pipe(ezs('TEEFTTokenize'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                assert.equal(res[0].sentences.length, 1);
                const firstSentence = res[0].sentences[0];
                assert(Array.isArray(firstSentence));
                assert.equal(firstSentence.length, 3);
                assert.equal(firstSentence[0], 'ça');
                assert.equal(firstSentence[1], 'va');
                assert.equal(firstSentence[2], 'héhé');
                done();
            });
    });

    it('should remove punctuation characters', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            sentences: ['ça va, héhé!'],
        }])
            .pipe(ezs('TEEFTTokenize'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                assert.equal(res[0].sentences[0].length, 3);
                const firstSentence = res[0].sentences[0];
                assert(Array.isArray(firstSentence));
                assert.equal(firstSentence.length, 3);
                assert.equal(firstSentence[0], 'ça');
                assert.equal(firstSentence[1], 'va');
                assert.equal(firstSentence[2], 'héhé');
                done();
            });
    });

    it('should output as many items as sentences', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            sentences: ['ça va?', 'héhé!'],
        }])
            .pipe(ezs('TEEFTTokenize'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                assert.equal(res[0].sentences.length, 2);
                const firstSentence = res[0].sentences[0];
                assert(Array.isArray(firstSentence));
                assert.equal(firstSentence.length, 2);
                assert.equal(firstSentence[0], 'ça');
                assert.equal(firstSentence[1], 'va');
                const secondSentence = res[0].sentences[1];
                assert(Array.isArray(secondSentence));
                assert.equal(secondSentence.length, 1);
                assert.equal(secondSentence[0], 'héhé');
                done();
            });
    });

    it('should not cut on dashes', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            // WARNING: TEEFTTokenize does not work well on uppercase
            // sentences: ['Do multi-agent plate-formes use TF-IDF'],
            sentences: ['do multi-agent plate-formes use tf-idf'],
        }])
            .pipe(ezs('TEEFTTokenize'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                assert.equal(res[0].sentences.length, 1);
                const tokens = res[0].sentences[0];
                assert.equal(tokens.length, 5);
                done();
            })
            .on('error', done);
    });
});

describe('stopwords', () => {
    it('should remove stopwords', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([{
            path: '/path/1',
            terms: [
                { term: 'elle', tag: ['PRO'], frequency: 1, length: 1 },
                { term: 'semble', tag: ['VER'], frequency: 1, length: 1 },
                { term: 'se', tag: ['PRO'], frequency: 1, length: 1 },
                { term: 'nourrir', tag: ['VER'], frequency: 1, length: 1 },
                { term: 'essentiellement', tag: ['ADV'], frequency: 1, length: 1 },
                { term: 'de', tag: ['PRP'], frequency: 2, length: 1 },
                { term: 'plancton', tag: ['NOM'], frequency: 1, length: 1 },
                { term: 'et', tag: ['KON'], frequency: 1, length: 1 },
                { term: 'hotdog', tag: ['NOM'], frequency: 1, length: 1 },
            ],
        }])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTStopWords'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const { terms } = res[0];
                assert.equal(terms.length, 5);
                done();
            });
    });

    it('should remove uppercase stopwords', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
            /* eslint-disable object-curly-newline */
                { frequency: 1, length: 1, term: 'Introduction', tag: ['NOM'] },
                { frequency: 14, length: 1, term: 'L', tag: ['NOM'] },
                { frequency: 5, length: 1, term: 'accès', tag: ['NOM'] },
            /* eslint-enable object-curly-newline */
            ],
        }])
            .pipe(ezs('TEEFTStopWords'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const { terms } = res[0];
                assert.equal(terms.length, 2);
                done();
            });
    });
});

describe('filter tags', () => {
    it('should keep only adjectives and names, by default', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([[{ id: 0, token: 'elle', tag: ['PRO:per'], lemma: 'elle' },
            { id: 1, token: 'semble', tag: ['VER'], lemma: 'sembler' },
            { id: 2, token: 'se', tag: ['PRO:per'], lemma: 'se' },
            { id: 3, token: 'nourrir', tag: ['VER'], lemma: 'nourrir' },
            { id: 4,
                token: 'essentiellement',
                tag: ['ADV'],
                lemma: 'essentiellement',
            },
            { id: 5, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 6, token: 'plancton', tag: ['NOM'], lemma: 'plancton' },
            { id: 7, token: 'frais', tag: ['ADJ'], lemma: 'frais' }]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTFilterTags'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 2);
                assert.equal(res[0].tag[0], 'NOM');
                assert.equal(res[1].tag[0], 'ADJ');
                done();
            });
    });

    it('should keep only passed tag', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([[{ id: 0, token: 'elle', tag: ['PRO:per'], lemma: 'elle' },
            { id: 1, token: 'semble', tag: ['VER'], lemma: 'sembler' },
            { id: 2, token: 'se', tag: ['PRO:per'], lemma: 'se' },
            { id: 3, token: 'nourrir', tag: ['VER'], lemma: 'nourrir' },
            { id: 4,
                token: 'essentiellement',
                tag: ['ADV'],
                lemma: 'essentiellement',
            },
            { id: 5, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 6, token: 'plancton', tag: ['NOM'], lemma: 'plancton' },
            { id: 7, token: 'frais', tag: ['ADJ'], lemma: 'frais' }]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTFilterTags', { tags: ['VER'] }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 2);
                assert.equal(res[0].tag[0], 'VER');
                done();
            });
    });

    it('should keep only passed tag (based on the beginning)', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([[{ id: 0, token: 'elle', tag: ['PRO:per'], lemma: 'elle' },
            { id: 1, token: 'semble', tag: ['VER'], lemma: 'sembler' },
            { id: 2, token: 'se', tag: ['PRO:per'], lemma: 'se' },
            { id: 3, token: 'nourrir', tag: ['VER'], lemma: 'nourrir' },
            { id: 4,
                token: 'essentiellement',
                tag: ['ADV'],
                lemma: 'essentiellement',
            },
            { id: 5, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 6, token: 'plancton', tag: ['NOM'], lemma: 'plancton' },
            { id: 7, token: 'frais', tag: ['ADJ'], lemma: 'frais' }]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTFilterTags', { tags: ['PRO'] }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 2);
                assert.equal(res[0].tag[0], 'PRO:per');
                done();
            });
    });

    it('should keep only passed tag, even if not the first', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([[{ id: 0, token: 'elle', tag: ['PRO:per'], lemma: 'elle' },
            { id: 1, token: 'semble', tag: ['VER'], lemma: 'sembler' },
            { id: 2, token: 'se', tag: ['PRO:per'], lemma: 'se' },
            { id: 3, token: 'nourrir', tag: ['VER'], lemma: 'nourrir' },
            { id: 4,
                token: 'essentiellement',
                tag: ['ADV'],
                lemma: 'essentiellement',
            },
            { id: 5, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 6, token: 'plancton', tag: ['NOM'], lemma: 'plancton' },
            { id: 7, token: 'frais', tag: ['ADJ'], lemma: 'frais' }]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTFilterTags', { tags: ['ART'] }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                assert.equal(res[0].tag[1], 'ART:def');
                done();
            });
    });
});

describe('extract sentence\'s terms', () => {
    it('should return 11 terms', () => {
        reinitSequenceFrequency();
        const taggedWords = [
            { token: 'elle', tag: ['PRO:per'] },
            { token: 'semble', tag: ['VER'] },
            { token: 'se', tag: ['PRO:per'] },
            { token: 'nourrir', tag: ['VER'] },
            {
                token: 'essentiellement',
                tag: ['ADV'],
            },
            { token: 'de', tag: ['PRE', 'ART:def'] },
            { token: 'plancton', tag: ['NOM'] },
            { token: 'frais', tag: ['ADJ'] },
            { token: 'et', tag: ['CON'] },
            { token: 'de', tag: ['PRE', 'ART:def'] },
            { token: 'hotdog', tag: ['UNK'] },
        ];
        const { termSequence, termFrequency } = extractSentenceTerms(taggedWords);
        assert.equal(termSequence.length, 11);
        assert.deepStrictEqual(termSequence, [
            'elle', 'semble', 'se', 'nourrir', 'essentiellement',
            'de', 'plancton', 'frais', 'plancton frais', 'et', 'hotdog',
        ]);
        assert.deepStrictEqual(termFrequency, {
            de: 2,
            elle: 1,
            essentiellement: 1,
            et: 1,
            frais: 1,
            hotdog: 1,
            nourrir: 1,
            plancton: 1,
            'plancton frais': 1,
            se: 1,
            semble: 1,
        });
    });

    it('should compute correct frequencies', () => {
        reinitSequenceFrequency();
        const taggedWords = [
            { token: 'elle', tag: ['PRO:per'] },
            { token: 'semble', tag: ['VER'] },
            { token: 'se', tag: ['PRO:per'] },
            { token: 'nourrir', tag: ['VER'] },
            {
                token: 'essentiellement',
                tag: ['ADV'],
            },
            { token: 'de', tag: ['PRE', 'ART:def'] },
            { token: 'plancton', tag: ['NOM'] },
            { token: 'frais', tag: ['ADJ'] },
            { token: 'et', tag: ['CON'] },
            { token: 'de', tag: ['PRE', 'ART:def'] },
            { token: 'hotdog', tag: ['UNK'] },
        ];
        const { termFrequency } = extractSentenceTerms(taggedWords, '', '');
        assert.equal(Object.keys(termFrequency).length, 11);
        assert.equal(termFrequency.elle, 1);
        assert.equal(termFrequency.de, 2);
    });
});

describe('extract terms', () => {
    it('should return 11 terms', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            sentences:
            [[
                { token: 'elle', tag: ['PRO:per'] },
                { token: 'semble', tag: ['VER'] },
                { token: 'se', tag: ['PRO:per'] },
                { token: 'nourrir', tag: ['VER'] },
                {
                    token: 'essentiellement',
                    tag: ['ADV'],
                },
                { token: 'de', tag: ['PRE', 'ART:def'] },
                { token: 'plancton', tag: ['NOM'] },
                { token: 'frais', tag: ['ADJ'] },
                { token: 'et', tag: ['CON'] },
                { token: 'de', tag: ['PRE', 'ART:def'] },
                { token: 'hotdog', tag: ['UNK'] },
            ]],
        }])
            .pipe(ezs('TEEFTExtractTerms'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert.ok(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const { terms } = res[0];
                assert.equal(terms.length, 11);
                assert.equal(terms[0].term, 'elle');
                assert.equal(terms[6].term, 'plancton');
                assert.equal(terms[7].term, 'frais');
                assert.equal(terms[8].term, 'plancton frais');
                assert.equal(terms[6].tag[0], 'NOM');
                assert.equal(terms[7].tag[0], 'ADJ');
                assert.strictEqual(terms[8].tag, undefined);
                assert.equal(terms[6].frequency, 1);
                assert.equal(terms[7].frequency, 1);
                assert.equal(terms[8].frequency, 1);
                assert.equal(terms[6].length, 1);
                assert.equal(terms[7].length, 1);
                assert.equal(terms[8].length, 2);
                done();
            });
    });

    it('should compute correct frequencies', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([{
            path: '/path/1',
            sentences:
            [[
                { id: 0, token: 'elle', tag: ['PRO:per'], lemma: 'elle' },
                { id: 1, token: 'semble', tag: ['VER'], lemma: 'sembler' },
                { id: 2, token: 'se', tag: ['PRO:per'], lemma: 'se' },
                { id: 3, token: 'nourrir', tag: ['VER'], lemma: 'nourrir' },
                { id: 4,
                    token: 'essentiellement',
                    tag: ['ADV'],
                    lemma: 'essentiellement',
                },
                { id: 5, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
                { id: 6, token: 'plancton', tag: ['NOM'], lemma: 'plancton' },
                { id: 7, token: 'frais', tag: ['ADJ'], lemma: 'frais' },
                { id: 8, token: 'et', tag: ['CON'], lemma: 'et' },
                { id: 9, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
                { id: 10, token: 'hotdog', tag: ['UNK'], lemma: 'hotdog' },
            ]],
        }])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTExtractTerms', { nounTag: '', adjTag: '' }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert.ok(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const { terms } = res[0];
                assert.equal(terms.length, 11);
                assert.equal(terms[0].term, 'elle');
                assert.equal(terms[0].lemma, 'elle');
                assert.equal(terms[0].tag[0], 'PRO:per');
                assert.equal(terms[0].frequency, 1);
                assert.equal(terms[5].frequency, 2);
                assert.equal(terms[10].length, 11);
                assert.strictEqual(terms[1].frequency, 1); // no undefined
                done();
            });
    });

    it('should return terms from several sentences', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            sentences: [[
                { token: 'elle', tag: ['PRO:per'] },
                { token: 'semble', tag: ['VER'] },
                { token: 'heureuse', tag: ['ADJ'] },
            ], [
                { token: 'mais', tag: ['CON'] },
                { token: 'pas', tag: ['FAKE'] },
                { token: 'lui', tag: ['PRO'] },
            ]],
        }])
            .pipe(ezs('TEEFTExtractTerms', { nounTag: '', adjTag: '' }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert.ok(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const { terms } = res[0];
                assert.equal(terms.length, 8); // One multiterm per sentence (no tags given)
                done();
            });
    });

    it('should consider two different documents as different', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            sentences: [[
                { token: 'elle', tag: ['PRO:per'] },
                { token: 'semble', tag: ['VER'] },
                { token: 'heureuse', tag: ['ADJ'] },
            ], [
                { token: 'mais', tag: ['CON'] },
                { token: 'pas', tag: ['FAKE'] },
                { token: 'lui', tag: ['PRO'] },
            ]],
        }, {
            path: '/path/2',
            sentences: [[
                { token: 'elle', tag: ['PRO:per'] },
                { token: 'est', tag: ['VER'] },
                { token: 'là', tag: ['ADV'] },
            ]],
        }])
            .pipe(ezs('TEEFTExtractTerms', { nounTag: '', adjTag: '' }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert.ok(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 2);
                const [doc1, doc2] = res;
                const { terms: terms1 } = doc1;
                const { terms: terms2 } = doc2;
                assert.equal(terms1.length, 8);
                assert.equal(terms1[1].term, 'semble');
                assert.equal(terms1[6].term, 'lui');
                assert.equal(terms1[1].frequency, 1);
                assert.equal(terms1[6].frequency, 1);
                assert.equal(terms2.length, 4);
                assert.equal(terms2[0].term, 'elle');
                assert.equal(terms2[0].frequency, 1); // That's the most important
                done();
            });
    });

    it.skip('should transform tokens into terms', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            sentences:
            [[
                { token: 'elle', tag: ['PRO:per'] },
                { token: 'semble', tag: ['VER'] },
                { token: 'se', tag: ['PRO:per'] },
                { token: 'nourrir', tag: ['VER'] },
                {
                    token: 'essentiellement',
                    tag: ['ADV'],
                },
                { token: 'de', tag: ['PRE', 'ART:def'] },
                { token: 'plancton', tag: ['NOM'] },
                { token: 'frais', tag: ['ADJ'] },
                { token: 'et', tag: ['CON'] },
                { token: 'de', tag: ['PRE', 'ART:def'] },
                { token: 'hotdog', tag: ['UNK'] },
            ]],
        }])
            .pipe(ezs('TEEFTExtractTerms'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert.ok(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const { terms } = res[0];
                assert.equal(terms.length, 3);
                assert.equal(terms[0].term, 'plancton');
                assert.equal(terms[0].token, undefined);
                assert.equal(terms[1].term, 'frais');
                assert.equal(terms[1].token, undefined);
                assert.equal(terms[2].term, 'plancton frais');
                assert.equal(terms[2].token, undefined);
                done();
            });
    });

    it('should return all monoterms', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            sentences:
            [[
                { token: 'elle', tag: ['PRO:per'] },
                { token: 'semble', tag: ['VER'] },
                { token: 'se', tag: ['PRO:per'] },
                { token: 'nourrir', tag: ['VER'] },
                {
                    token: 'essentiellement',
                    tag: ['ADV'],
                },
                { token: 'de', tag: ['PRE', 'ART:def'] },
                { token: 'plancton', tag: ['NOM'] },
                { token: 'frais', tag: ['ADJ'] },
                { token: 'et', tag: ['CON'] },
                { token: 'de', tag: ['PRE', 'ART:def'] },
                { token: 'hotdog', tag: ['UNK'] },
            ]],
        }])
            .pipe(ezs('TEEFTExtractTerms'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert.ok(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const { terms } = res[0];
                assert.equal(terms.length, 11);
                assert.deepStrictEqual(terms, [{
                    frequency: 1,
                    length: 1,
                    token: 'elle',
                    tag: ['PRO:per'],
                    term: 'elle',
                }, {
                    frequency: 1,
                    length: 1,
                    token: 'semble',
                    tag: ['VER'],
                    term: 'semble',
                }, {
                    frequency: 1, length: 1, token: 'se', tag: ['PRO:per'], term: 'se',
                }, {
                    frequency: 1,
                    length: 1,
                    token: 'nourrir',
                    tag: ['VER'],
                    term: 'nourrir',
                }, {
                    frequency: 1,
                    length: 1,
                    token: 'essentiellement',
                    tag: ['ADV'],
                    term: 'essentiellement',
                }, {
                    frequency: 2, length: 1, token: 'de', tag: ['PRE', 'ART:def'], term: 'de',
                }, {
                    frequency: 1,
                    length: 1,
                    token: 'plancton',
                    tag: ['NOM'],
                    term: 'plancton',
                }, {
                    frequency: 1,
                    length: 1,
                    token: 'frais',
                    tag: ['ADJ'],
                    term: 'frais',
                }, {
                    frequency: 1,
                    length: 2,
                    token: 'plancton frais',
                    term: 'plancton frais',
                }, {
                    frequency: 1, length: 1, token: 'et', tag: ['CON'], term: 'et',
                }, {
                    frequency: 1,
                    length: 1,
                    token: 'hotdog',
                    tag: ['UNK'],
                    term: 'hotdog',
                }]);
                done();
            });
    });
});

describe('sum up frequencies', () => {
    it('should sum up frequencies in several sentences', (done) => {
        const res = [];
        /* eslint-disable object-curly-newline */
        from([{
            path: '/path/1',
            sentences: [[
                { id: 0, token: 'elle', tag: ['PRO:per'], lemma: 'elle' },
                { id: 1, token: 'semble', tag: ['VER'], lemma: 'sembler' },
                { id: 2, token: 'se', tag: ['PRO:per'], lemma: 'se' },
                { id: 3, token: 'nourrir', tag: ['VER'], lemma: 'nourrir' },
                { id: 4,
                    token: 'essentiellement',
                    tag: ['ADV'],
                    lemma: 'essentiellement',
                },
                { id: 5, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
            ], [
                { id: 6, token: 'plancton', tag: ['NOM'], lemma: 'plancton' },
                { id: 7, token: 'frais', tag: ['ADJ'], lemma: 'frais' },
                { id: 8, token: 'et', tag: ['CON'], lemma: 'et' },
                { id: 9, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
                { id: 10, token: 'hotdog', tag: ['UNK'], lemma: 'hotdog' },
            ]],
        }])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTExtractTerms', { nounTag: '', adjTag: '' }))
            .pipe(ezs('TEEFTSumUpFrequencies'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert.equal(typeof chunk, 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const { terms } = res[0];
                assert.equal(terms.length, 12);
                assert.equal(terms[5].lemma, 'de');
                assert.equal(terms[5].frequency, 2);
                done();
            });
    });

    it('should sum up frequencies in several sentences, and no lemma', (done) => {
        const res = [];
        /* eslint-disable object-curly-newline */
        from([{
            path: '/path/1',
            sentences: [[
                { id: 0, token: 'elle', tag: ['PRO:per'] },
                { id: 1, token: 'semble', tag: ['VER'] },
                { id: 2, token: 'se', tag: ['PRO:per'] },
                { id: 3, token: 'nourrir', tag: ['VER'] },
                { id: 4,
                    token: 'essentiellement',
                    tag: ['ADV'],
                },
                { id: 5, token: 'de', tag: ['PRE', 'ART:def'] },
            ], [
                { id: 6, token: 'plancton', tag: ['NOM'] },
                { id: 7, token: 'frais', tag: ['ADJ'] },
                { id: 8, token: 'et', tag: ['CON'] },
                { id: 9, token: 'de', tag: ['PRE', 'ART:def'] },
                { id: 10, token: 'hotdog', tag: ['UNK'] },
            ]],
        }])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTExtractTerms', { nounTag: '', adjTag: '' }))
            .pipe(ezs('TEEFTSumUpFrequencies'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert.equal(typeof chunk, 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const { terms } = res[0];
                assert.equal(terms.length, 12);
                assert.equal(terms[5].token, 'de');
                assert.equal(terms[5].frequency, 2);
                done();
            });
    });
});

describe('compute specificity', () => {
    it('should work without weights', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                /* eslint-disable object-curly-newline */
                { frequency: 8, length: 1, term: 'elle', id: 0, tag: ['PRO:per'], lemma: 'elle' },
                { frequency: 1, length: 1, term: 'semble', id: 1, tag: ['VER'], lemma: 'sembler' },
                { frequency: 1, length: 1, term: 'se', id: 2, tag: ['PRO:per'], lemma: 'se' },
                { frequency: 1, length: 1, term: 'nourrir', id: 3, tag: ['VER'], lemma: 'nourrir' },
                { frequency: 1, length: 1, term: 'essentiellement', id: 4, tag: ['ADV'], lemma: 'essentiellement' },
                { frequency: 2, length: 1, term: 'de', id: 9, tag: ['PRE', 'ART:def'], lemma: 'de' },
                { frequency: 1, length: 1, term: 'plancton', id: 6, tag: ['NOM'], lemma: 'plancton' },
                { frequency: 1, length: 1, term: 'frais', id: 7, tag: ['ADJ'], lemma: 'frais' },
                { frequency: 1, length: 1, term: 'et', id: 8, tag: ['CON'], lemma: 'et' },
                { frequency: 1, length: 1, term: 'hotdog', id: 10, tag: ['UNK'], lemma: 'hotdog' },
                /* eslint-enable object-curly-newline */
            ],
        }])
            .pipe(ezs('TEEFTSpecificity', { weightedDictionary: null, filter: false }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const { terms } = res[0];
                assert.equal(terms.length, 10);
                assert.equal(terms[0].lemma, 'elle');
                assert.equal(terms[0].frequency, 8);
                assert.equal(terms[0].specificity, 1);
                done();
            });
    });

    it('should work with weights', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                /* eslint-disable object-curly-newline */
                { frequency: 1, length: 1, term: 'semble', id: 1, tag: ['VER'], lemma: 'sembler' },
                { frequency: 1, length: 1, term: 'nourrir', id: 3, tag: ['VER'], lemma: 'nourrir' },
                { frequency: 1, length: 1, term: 'essentiellement', id: 4, tag: ['ADV'], lemma: 'essentiellement' },
                { frequency: 1, length: 1, term: 'plancton', id: 6, tag: ['NOM'], lemma: 'plancton' },
                { frequency: 1, length: 1, term: 'frais', id: 7, tag: ['ADJ'], lemma: 'frais' },
                { frequency: 1, length: 1, term: 'hotdog', id: 10, tag: ['UNK'], lemma: 'hotdog' },
                /* eslint-enable object-curly-newline */
            ],
        }])
            .pipe(ezs('TEEFTSpecificity', { filter: false }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const { terms } = res[0];
                assert.equal(terms.length, 6);
                assert.equal(terms[0].term, 'semble');
                assert.equal(terms[0].frequency, 1);
                assert.equal(terms[0].specificity, 0.0008964346775894244);
                done();
            });
    });

    it('should work with weights and filter', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                /* eslint-disable object-curly-newline */
                { frequency: 1, length: 1, term: 'semble', id: 1, tag: ['VER'], lemma: 'sembler' },
                { frequency: 1, length: 1, term: 'nourrir', id: 3, tag: ['VER'], lemma: 'nourrir' },
                { frequency: 1, length: 1, term: 'essentiellement', id: 4, tag: ['ADV'], lemma: 'essentiellement' },
                { frequency: 1, length: 1, term: 'plancton', id: 6, tag: ['NOM'], lemma: 'plancton' },
                { frequency: 1, length: 1, term: 'frais', id: 7, tag: ['ADJ'], lemma: 'frais' },
                { frequency: 1, length: 1, term: 'hotdog', id: 10, tag: ['UNK'], lemma: 'hotdog' },
                /* eslint-enable object-curly-newline */
            ],
        }])
            .pipe(ezs('TEEFTSpecificity'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const { terms } = res[0];
                assert.equal(terms.length, 1);
                assert.equal(terms[0].lemma, 'hotdog');
                assert.equal(terms[0].frequency, 1);
                assert.equal(terms[0].specificity, 1);
                done();
            });
    });

    it('should sort when asked', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                /* eslint-disable object-curly-newline */
                { frequency: 8, length: 1, term: 'elle', id: 0, tag: ['PRO:per'], lemma: 'elle' },
                { frequency: 1, length: 1, term: 'semble', id: 1, tag: ['VER'], lemma: 'sembler' },
                { frequency: 1, length: 1, term: 'se', id: 2, tag: ['PRO:per'], lemma: 'se' },
                { frequency: 1, length: 1, term: 'nourrir', id: 3, tag: ['VER'], lemma: 'nourrir' },
                { frequency: 1, length: 1, term: 'essentiellement', id: 4, tag: ['ADV'], lemma: 'essentiellement' },
                { frequency: 2, length: 1, term: 'de', id: 9, tag: ['PRE', 'ART:def'], lemma: 'de' },
                { frequency: 1, length: 1, term: 'plancton', id: 6, tag: ['NOM'], lemma: 'plancton' },
                { frequency: 1, length: 1, term: 'frais', id: 7, tag: ['ADJ'], lemma: 'frais' },
                { frequency: 1, length: 1, term: 'et', id: 8, tag: ['CON'], lemma: 'et' },
                { frequency: 1, length: 1, term: 'hotdog', id: 10, tag: ['UNK'], lemma: 'hotdog' },
                /* eslint-enable object-curly-newline */
            ],
        }])
            .pipe(ezs('TEEFTSpecificity', { sort: true, weightedDictionary: '', filter: false }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const { terms } = res[0];
                assert.equal(terms.length, 10);
                for (let i = 0; i < terms.length - 1; i += 1) {
                    assert.ok(terms[i].specificity >= terms[i + 1].specificity);
                }
                done();
            });
    });

    it('should work whatever the order of terms', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                /* eslint-disable object-curly-newline */
                { frequency: 1, length: 1, term: 'semble', id: 1, tag: ['VER'], lemma: 'sembler' },
                { frequency: 1, length: 1, term: 'se', id: 2, tag: ['PRO:per'], lemma: 'se' },
                { frequency: 1, length: 1, term: 'nourrir', id: 3, tag: ['VER'], lemma: 'nourrir' },
                { frequency: 1, length: 1, term: 'essentiellement', id: 4, tag: ['ADV'], lemma: 'essentiellement' },
                { frequency: 2, length: 1, term: 'de', id: 9, tag: ['PRE', 'ART:def'], lemma: 'de' },
                { frequency: 1, length: 1, term: 'plancton', id: 6, tag: ['NOM'], lemma: 'plancton' },
                { frequency: 1, length: 1, term: 'frais', id: 7, tag: ['ADJ'], lemma: 'frais' },
                { frequency: 1, length: 1, term: 'et', id: 8, tag: ['CON'], lemma: 'et' },
                { frequency: 1, length: 1, term: 'hotdog', id: 10, tag: ['UNK'], lemma: 'hotdog' },
                { frequency: 8, length: 1, term: 'elle', id: 0, tag: ['PRO:per'], lemma: 'elle' },
                /* eslint-enable object-curly-newline */
            ],
        }])
            .pipe(ezs('TEEFTSpecificity', { sort: true, weightedDictionary: '', filter: false }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const { terms } = res[0];
                assert.equal(terms.length, 10);
                assert.equal(terms.find(t => t.term === 'elle').specificity, 1);
                assert.equal(terms.find(t => t.term === 'de').specificity, 0.25);
                assert.equal(terms.find(t => t.term === 'semble').specificity, 0.125);
                done();
            });
    });

    it('should keep multiterms (terms without tags)', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                /* eslint-disable object-curly-newline */
                { frequency: 3, length: 1, term: 'logiciel', id: 2703, tag: ['ADJ', 'NOM'], lemma: 'logiciel' },
                { frequency: 1, length: 1, term: 'content', id: 2704, tag: ['NOM', 'ADJ', 'VER'], lemma: 'content' },
                { frequency: 1, length: 2, term: 'logiciel content' },
                { frequency: 1, length: 1, term: 'management', id: 2706, tag: ['NOM'], lemma: 'management' },
                /* eslint-enable object-curly-newline */
            ],
        }])
            .pipe(ezs('TEEFTSpecificity', { sort: true, weightedDictionary: '', filter: true }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const { terms } = res[0];
                assert.equal(terms.length, 2);
                assert.equal(terms[0].lemma, 'logiciel');
                assert.equal(terms[0].frequency, 3);
                assert.equal(terms[0].specificity, 1);
                assert.equal(terms[1].term, 'logiciel content');
                assert.equal(terms[1].frequency, 1);
                assert.equal(terms[1].length, 2);
                assert.equal(terms[1].specificity, 1 / 3);
                done();
            });
    });

    it('should compute average specificity only on monoterms', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                /* eslint-disable object-curly-newline */
                { frequency: 1, length: 1, term: 'logiciel', id: 2703, tag: ['ADJ', 'NOM'], lemma: 'logiciel' },
                { frequency: 1, length: 1, term: 'content', id: 2704, tag: ['NOM', 'ADJ', 'VER'], lemma: 'content' },
                { frequency: 10, length: 2, term: 'logiciel content' },
                { frequency: 1, length: 1, term: 'management', id: 2706, tag: ['NOM'], lemma: 'management' },
                /* eslint-enable object-curly-newline */
            ],
        }])
            .pipe(ezs('TEEFTSpecificity', { sort: true, filter: true }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const { terms } = res[0];
                assert.equal(terms.length, 2);
                assert.equal(terms[0].tag, undefined); // multiterm
                assert.equal(terms[0].specificity, 1);
                assert(terms[1].tag); // monoterm
                done();
            });
    });

    it('should not crash when input is empty', (done) => {
        let res = [];
        let err;
        from([])
            .pipe(ezs('TEEFTSpecificity'))
            // .pipe(ezs('debug'))
            .pipe(ezs.catch((error) => { err = error; }))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 0);
                done(err);
            })
            .on('error', done);
    });

    it('should work on several documents', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([{
            path: '/path/1',
            terms: [
                { frequency: 3, length: 1, term: 'logiciel', id: 2703, tag: ['ADJ', 'NOM'], lemma: 'logiciel' },
                { frequency: 1, length: 1, term: 'content', id: 2704, tag: ['NOM', 'ADJ', 'VER'], lemma: 'content' },
                { frequency: 1, length: 2, term: 'logiciel content' },
            ],
        }, {
            path: '/path/2',
            terms: [
                { frequency: 1, length: 1, term: 'management', id: 2706, tag: ['NOM'], lemma: 'management' },
            ],
        }])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTSpecificity', { sort: true, weightedDictionary: '', filter: false }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 2);
                const { terms: terms1 } = res[0];
                const { terms: terms2 } = res[1];

                assert.equal(terms1.length, 3);
                assert.equal(terms1[0].lemma, 'logiciel');
                assert.equal(terms1[0].frequency, 3);
                assert.equal(terms1[0].specificity, 1);

                assert.equal(terms1[2].term, 'logiciel content');
                assert.equal(terms1[2].frequency, 1);
                assert.equal(terms1[2].length, 2);
                assert.equal(Math.floor(terms1[2].specificity * 1000), Math.floor(1 / 3 * 1000));

                assert.equal(terms2.length, 1);
                assert.equal(terms2[0].term, 'management');
                assert.equal(terms2[0].frequency, 1);
                assert.equal(terms2[0].specificity, 1 / 1);
                done();
            });
    });
});

describe('filter multiterms and frequent monoterms', () => {
    it('should keep frequent monoterms', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                /* eslint-disable object-curly-newline */
                { frequency: 8, length: 1, term: 'elle', tag: ['PRO:per'], lemma: 'elle' },
                { frequency: 1, length: 1, term: 'semble', tag: ['VER'], lemma: 'sembler' },
                { frequency: 1, length: 1, term: 'se', tag: ['PRO:per'], lemma: 'se' },
                { frequency: 1, length: 1, term: 'nourrir', tag: ['VER'], lemma: 'nourrir' },
                { frequency: 1, length: 1, term: 'essentiellement', tag: ['ADV'], lemma: 'essentiellement' },
                { frequency: 2, length: 1, term: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
                { frequency: 1, length: 1, term: 'plancton', tag: ['NOM'], lemma: 'plancton' },
                { frequency: 1, length: 1, term: 'frais', tag: ['ADJ'], lemma: 'frais' },
                { frequency: 1, length: 1, term: 'et', tag: ['CON'], lemma: 'et' },
                { frequency: 1, length: 1, term: 'hotdog', tag: ['UNK'], lemma: 'hotdog' },
                /* eslint-enable object-curly-newline */
            ],
        }])
            .pipe(ezs('TEEFTFilterMonoFreq'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert.ok(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const { terms } = res[0];
                assert.equal(terms.length, 1);
                assert.ok(terms[0]);
                assert.equal(terms[0].term, 'elle');
                assert.equal(terms[0].frequency, 8);
                done();
            });
    });

    it('should keep multiterms', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                /* eslint-disable object-curly-newline */
                { frequency: 1, length: 1, term: 'elle', tag: ['PRO:per'], lemma: 'elle' },
                { frequency: 1, length: 1, term: 'semble', tag: ['VER'], lemma: 'sembler' },
                { frequency: 1, length: 1, term: 'se', tag: ['PRO:per'], lemma: 'se' },
                { frequency: 1, length: 1, term: 'nourrir', tag: ['VER'], lemma: 'nourrir' },
                { frequency: 1, length: 1, term: 'essentiellement', tag: ['ADV'], lemma: 'essentiellement' },
                { frequency: 2, length: 1, term: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
                { frequency: 1, length: 6, term: 'elle sembler se nourrir essentiellement de' },
                { frequency: 1, length: 1, term: 'plancton', tag: ['NOM'], lemma: 'plancton' },
                { frequency: 1, length: 1, term: 'frais', tag: ['ADJ'], lemma: 'frais' },
                { frequency: 1, length: 1, term: 'et', tag: ['CON'], lemma: 'et' },
                { frequency: 1, length: 1, term: 'hotdog', tag: ['UNK'], lemma: 'hotdog' },
                { frequency: 1, length: 5, term: 'plancton frais et de hotdog' },
                /* eslint-enable object-curly-newline */
            ],
        }])
            .pipe(ezs('TEEFTFilterMonoFreq'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert.ok(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const { terms } = res[0];
                assert.equal(terms.length, 2);
                assert.equal(terms[0].term, 'elle sembler se nourrir essentiellement de');
                assert.equal(terms[1].term, 'plancton frais et de hotdog');
                done();
            });
    });
});

describe('natural', () => {
    describe('tag', () => {
        it('should correctly tag a sentence in French', (done) => {
            let res = [];
            from([{
                path: '/path/1',
                sentences: [
                    ['Elle', 'semble', 'se', 'nourrir', 'essentiellement', 'de', 'plancton', 'et', 'de', 'hotdog'],
                ],
            }])
                .pipe(ezs('TEEFTNaturalTag'))
                // .pipe(ezs('debug'))
                .on('data', (chunk) => {
                    assert(chunk);
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 1);
                    assert.equal(res[0].sentences.length, 1);
                    const firstSentence = res[0].sentences[0];
                    assert.equal(firstSentence.length, 10);
                    assert.equal(firstSentence[1].token, 'semble');
                    assert.equal(firstSentence[1].tag[0], 'VER');
                    assert.equal(firstSentence[4].token, 'essentiellement');
                    assert.equal(firstSentence[4].tag[0], 'ADV');
                    done();
                });
        });

        it('should correctly tag a sentence in French with accented words', (done) => {
            let res = [];
            from([{
                path: '/path/1',
                sentences: [['Ça', 'veut', 'sûrement', 'dire', 'qu\'', 'il', 'fut', 'assassiné']],
            }])
                .pipe(ezs('TEEFTNaturalTag'))
                // .pipe(ezs('debug'))
                .on('data', (chunk) => {
                    assert(chunk);
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 1);
                    assert.equal(res[0].sentences.length, 1);
                    const firstSentence = res[0].sentences[0];
                    assert.equal(firstSentence.length, 8);
                    assert.equal(firstSentence[1].token, 'veut');
                    assert.equal(firstSentence[1].tag[0], 'VER');
                    assert.equal(firstSentence[2].token, 'sûrement');
                    assert.equal(firstSentence[2].tag[0], 'ADV');
                    done();
                });
        });

        it('should correctly tag two sentences in French with accented words', (done) => {
            let res = [];
            from([{
                path: '/path/1',
                sentences: [
                    ['Ça', 'veut', 'sûrement', 'dire', 'qu\'', 'il', 'fut', 'assassiné'],
                    ['Mais', 'j\'', 'espère', 'que', 'ce', 'n\'', 'était', 'pas', 'grave'],
                ],
            }])
                .pipe(ezs('TEEFTNaturalTag'))
                // .pipe(ezs('debug'))
                .on('data', (chunk) => {
                    assert(chunk);
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 1);
                    assert.equal(res[0].sentences.length, 2);
                    const firstSentence = res[0].sentences[0];
                    assert.equal(firstSentence.length, 8);
                    assert.equal(firstSentence[1].token, 'veut');
                    assert.equal(firstSentence[1].tag[0], 'VER');
                    assert.equal(firstSentence[2].token, 'sûrement');
                    assert.equal(firstSentence[2].tag[0], 'ADV');
                    const secondSentence = res[0].sentences[1];
                    assert.equal(secondSentence.length, 9);
                    assert.equal(secondSentence[0].token, 'Mais');
                    assert(secondSentence[0].tag);
                    assert.equal(secondSentence[0].tag[0], 'KON');
                    assert.equal(secondSentence[1].token, 'j\'');
                    assert.equal(secondSentence[1].tag[0], 'PRO');
                    done();
                });
        });
    });

    describe('sentence-tokenize', () => {
        it('should correctly segment sentences', (done) => {
            let res = [];
            from([{
                path: '/path/1',
                content: 'Je ne suis pas sûr. Il faut un tableau.',
            }])
                .pipe(ezs('TEEFTSentenceTokenize'))
                // .pipe(ezs('debug'))
                .on('data', (chunk) => {
                    assert(chunk);
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 1);
                    assert.equal(res[0].sentences.length, 2);
                    assert.equal(res[0].sentences[0], 'Je ne suis pas sûr.');
                    assert.equal(res[0].sentences[1], 'Il faut un tableau.');
                    done();
                });
        });

        it('should correctly segment sentences in several strings', (done) => {
            let res = [];
            from([{
                path: '/path/1',
                content: 'Il faut un tableau.',
            }, {
                path: '/path/2',
                content: 'Et ça j\'en suis sûr. Maintenant!',
            }])
                .pipe(ezs('TEEFTSentenceTokenize'))
                // .pipe(ezs('debug'))
                .on('data', (chunk) => {
                    assert(chunk);
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 2);
                    assert.equal(res[0].sentences.length, 1);
                    assert.equal(res[1].sentences.length, 2);
                    assert.equal(res[0].sentences[0], 'Il faut un tableau.');
                    assert.equal(res[1].sentences[0], 'Et ça j\'en suis sûr.');
                    assert.equal(res[1].sentences[1], 'Maintenant!');
                    done();
                });
        });

        it('should work with empty sentences', (done) => {
            let res = [];
            from([{
                path: '/path/1',
                content: '',
            }, {
                path: '/path/2',
                content: 'Et ça j\'en suis sûr. Maintenant!',
            }])
                .pipe(ezs('TEEFTSentenceTokenize'))
                // .pipe(ezs('debug'))
                .on('data', (chunk) => {
                    assert(chunk);
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 2);
                    assert.equal(res[0].sentences.length, 0);
                    assert.equal(res[1].sentences[0], 'Et ça j\'en suis sûr.');
                    assert.equal(res[1].sentences[1], 'Maintenant!');
                    done();
                });
        });

        it('should work with fake sentences', (done) => {
            let res = [];
            from([{
                path: '/path/1',
                content: '.',
            }, {
                path: '/path/2',
                content: '?',
            }])
                .pipe(ezs('TEEFTSentenceTokenize'))
                // .pipe(ezs('debug'))
                .on('data', (chunk) => {
                    assert(chunk);
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 2);
                    assert.equal(res[0].sentences[0], '.');
                    assert.equal(res[1].sentences[0], '?');
                    done();
                });
        });
    });
});

describe('filter-multi-spec', () => {
    it('should return all monoterms', (done) => {
        let res = [];
        const input = {
            path: '/path/1',
            terms: [
                { length: 1, term: 'elle', tag: ['PRO:per'] },
                { length: 1, term: 'semble', tag: ['VER'] },
                { length: 1, term: 'se', tag: ['PRO:per'] },
                { length: 1, term: 'nourrir', tag: ['VER'] },
                { length: 1, term: 'essentiellement', tag: ['ADV'] },
                { length: 1, term: 'de', tag: ['PRE', 'ART:def'] },
                { length: 1, term: 'plancton', tag: ['NOM'] },
                { length: 1, term: 'frais', tag: ['ADJ'] },
                { length: 1, term: 'et', tag: ['CON'] },
                { length: 1, term: 'hotdog', tag: ['UNK'] },
            ],
        };
        from([input])
            .pipe(ezs('TEEFTFilterMultiSpec'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(chunk);
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const { terms } = res[0];
                assert.equal(terms.length, input.terms.length);
                done();
            });
    });

    it('should return all multiterms above average spec', (done) => {
        let res = [];
        const input = {
            path: '/path/1',
            terms: [
                { length: 2, specificity: 0.5, term: 'apprentissage automatique' },
                { length: 3, specificity: 0.5, term: 'réseau de neurones' },
                { length: 4, specificity: 0.24, term: 'information scientifique et technique' },
                { length: 4, specificity: 0.75, term: 'enseignement supérieur et recherche' },
            ],
        };
        from([input])
            .pipe(ezs('TEEFTFilterMultiSpec'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(chunk);
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const { terms } = res[0];
                assert.equal(terms.length, 3);
                assert.equal(terms[0].specificity, 0.5);
                assert.equal(terms[0].term, 'apprentissage automatique');
                assert.equal(terms[2].specificity, 0.75);
                assert.equal(terms[2].term, 'enseignement supérieur et recherche');
                done();
            });
    });

    it('should return all multiterms above average spec, and all monoterms', (done) => {
        let res = [];
        const input = {
            path: '/path/1',
            terms: [
                { length: 2, specificity: 0.5, token: 'apprentissage automatique' },
                { length: 3, specificity: 0.5, token: 'réseau de neurones' },
                { length: 4, specificity: 0.24, token: 'information scientifique et technique' },
                { length: 4, specificity: 0.75, token: 'enseignement supérieur et recherche' },
                { length: 1, token: 'elle', tag: ['PRO:per'] },
                { length: 1, token: 'semble', tag: ['VER'] },
            ],
        };
        from([input])
            .pipe(ezs('TEEFTFilterMultiSpec'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(chunk);
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const { terms } = res[0];
                assert.equal(terms.length, 5);
                assert.equal(terms[0].specificity, 0.5);
                assert.equal(terms[0].token, 'apprentissage automatique');
                assert.equal(terms[2].specificity, 0.75);
                assert.equal(terms[2].token, 'enseignement supérieur et recherche');
                done();
            });
    });
});

describe('to lower case', () => {
    it('should work on input by default', (done) => {
        from(['ÇA DEVRAIT ÊTRE MIS EN BAS DE CASSE!'])
            .pipe(ezs('ToLowerCase'))
            .on('data', (text) => {
                assert.equal(text, 'ça devrait être mis en bas de casse!');
                done();
            })
            .on('error', done);
    });

    it('should use path to select on which part to work', (done) => {
        const res = [];
        from([{ t: 'This Is My Text' }])
            .pipe(ezs('ToLowerCase', { path: ['t'] }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const obj = res[0];
                assert.equal(obj.t, 'this is my text');
                done();
            })
            .on('error', done);
    });

    it('should use path to select in arrays too', (done) => {
        const res = [];
        from([[{ t: 'This Is My Text' }]])
            .pipe(ezs('ToLowerCase', { path: ['t'] }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const arr = res[0];
                assert.equal(arr.length, 1);
                const obj = arr[0];
                assert.equal(obj.t, 'this is my text');
                done();
            })
            .on('error', done);
    });

    it('should work on several items', (done) => {
        const res = [];
        from([{ content: 'This is Content!' }, { content: 'This too.' }])
            .pipe(ezs('ToLowerCase', { path: ['content'] }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 2);
                const obj1 = res[0];
                const obj2 = res[1];
                assert.equal(obj1.content, 'this is content!');
                assert.equal(obj2.content, 'this too.');
                done();
            })
            .on('error', done);
    });

    it('should keep other properties', (done) => {
        const res = [];
        from([{
            content: 'This is Content!',
            other: 1,
        }, {
            content: 'This too.',
            other: 2,
        }])
            .pipe(ezs('ToLowerCase', { path: ['content'] }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.deepStrictEqual(res, [
                    { content: 'this is content!', other: 1 },
                    { content: 'this too.', other: 2 },
                ]);
                done();
            })
            .on('error', done);
    });
});
