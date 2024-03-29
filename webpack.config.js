const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    "mode": "production",//"development",//
    "entry": {
    	"app": "./src/App.jsx"
    },
    "output": {
        "path": __dirname+'/docs',
        "filename": "[name].[chunkhash:8].js"
    },
    "module": {
        "rules": [
            {
                "test": /\.(js|jsx)$/,
                "exclude": /node_modules/,
                "use": {
                    "loader": "babel-loader",
                    "options": {
                        "presets": [
                            "@babel/env",
                            "@babel/react"
                        ]
                    }
                }
            },
            {
                "test": /\.(scss|css)$/,
                "use": [
                    "style-loader",
                    "css-loader",
                    "sass-loader"
                ]
            }
        ]
    },
    "plugins": [
    	new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
        	"template": 'src/index.html',
        	"title": "Bela Lily - Área Restrita",
            "hash": true,
            "chunks": ["app"],
            "path": __dirname+'/static',
            "filename": 'index.html' //relative to root of the application
        }),
        new CopyPlugin([{
        		"from": "src/assets",
        		"to":  "assets"
        	}
        ])
    ],
    "resolve": {
        "modules": [
          "node_modules",
          __dirname+'/src'
        ],
        "extensions": [".js", ".json", ".jsx", ".scss", "css"]
    },
    "target": "web",
    "devServer": {
        "contentBase": __dirname+'/static',
        "port": 8081
    },
}