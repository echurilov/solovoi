const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: "./app/index.js",
    output: {
        filename: "./solovoi.js"
    },
    plugins: [
        // new webpack.DefinePlugin({
        //     IS_DEV: IS_DEV
        // }),

        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'index.ejs'),
            title: 'Solovoi'
        })
    ],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    devtool: "source-map",
    resolve: {
        extensions: [".js", ".jsx", "*"]
    }
};
