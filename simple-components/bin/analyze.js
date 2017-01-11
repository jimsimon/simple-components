const Analyzer = require('polymer-analyzer').Analyzer;
const FSUrlLoader = require('polymer-analyzer/lib/url-loader/fs-url-loader').FSUrlLoader;
const PackageUrlResolver = require('polymer-analyzer/lib/url-loader/package-url-resolver').PackageUrlResolver;
const generateElementMetadata = require('polymer-analyzer/lib/generate-elements').generateElementMetadata;
const path = require('path');
const fs = require('fs');

function analyze(root, inputs) {
    return new Promise(function(resolve, reject) {
        const analyzer = new Analyzer({
            urlLoader: new FSUrlLoader(root),
            urlResolver: new PackageUrlResolver({componentDir: 'node_modules/'})
        });

        const elements = new Set();
        const isInDependency = /(\b|\/|\\)(bower_components|node_modules)(\/|\\)/;

        var promises = [];
        for (var i = 0; i<inputs.length; i++) {
            const input = inputs[i];
            promises.push(analyzer.analyze(input));
        }

        Promise.all(promises).then(function (documents) {
            documents.forEach(function(document) {
                const docElements = Array.from(document.getByKind('')).filter(function(e) { !isInDependency.test(e.sourceRange.file)});
                docElements.forEach(function (e) { elements.add(e) });
            });
            resolve(generateElementMetadata(Array.from(elements), ''));
        });
    });
}

analyze(path.join(__dirname, '../'), ['simple-test/simple-test.html']).then(function(metadata){
    fs.writeFileSync('elements.json', JSON.stringify(metadata, null, 2));
});
