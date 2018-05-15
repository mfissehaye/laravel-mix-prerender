let mix = require('laravel-mix');
let path = require('path');
let fs = require('fs')

class Prerender {
    dependencies() {
        this.requiresReload = true;
        return [
            'html-webpack-plugin',
            'prerender-spa-plugin',
        ]
    }

    register({routes, template}) {
        if(!routes) routes = ['/']
        if(!template) template = 'resources/views/welcome.blade.php'
        this.routes = routes
        this.template = template
    }

    webpackConfig(webpackConfig) {
        let HtmlWebpackPlugin = require('html-webpack-plugin');
        let PrerenderSpaPlugin = require('prerender-spa-plugin');
        let CopyWebpackPlugin = require('copy-webpack-plugin');
        webpackConfig.plugins.push(
            new HtmlWebpackPlugin({
                template: this.template,
                inject: false,
            }),

            new PrerenderSpaPlugin({
                staticDir: webpackConfig.output.path,
                routes: this.routes,
                postProcess: (renderedRoute) => {
                    
                    renderedRoute.html = renderedRoute.html.replace("<div id=\"app\"", "<div id=\"app\" server-rendered=\"true\"")
                    renderedRoute.html = renderedRoute.html.replace("<script>window.__SERVER__=true<script>", "<script>window.__SERVER__=false<script>")

                    let route = renderedRoute.route.replace('/', '')
                    if(!route) route = 'index'
                    renderedRoute.outputPath = path.resolve(
                        path.dirname(this.template),
                        'rendered', 
                        route + '.blade.php'
                    )
                    return renderedRoute;
                }
            }),
        )

    }
}

mix.extend('prerender', new Prerender());