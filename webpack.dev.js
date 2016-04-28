require('babel-loader');

module.exports = {
    entry: './src/index.js',
    output: {
        path: __dirname + '/example',
        filename: 'build.js',
        libraryTarget: 'var'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015', 'stage-0']
                }
            }
        ]
    }
};
