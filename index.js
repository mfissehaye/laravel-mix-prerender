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

    register({routes, template, transform}) {
        if(!routes) routes = ['/']
        if(!template) template = 'resources/views/welcome.blade.php'
        if(!transform) transform = () => {}
        this.routes = routes
        this.template = template
        this.transform = transform
    }

    webpackConfig(webpackConfig) {
        console.log(path.dirname(this.template),
        'rendered')
        let HtmlWebpackPlugin = require('html-webpack-plugin');
        let PrerenderSpaPlugin = require('prerender-spa-plugin');
        webpackConfig.plugins.push(
            new HtmlWebpackPlugin({
                template: this.template,
                inject: false,
            }),

            new PrerenderSpaPlugin({
                staticDir: webpackConfig.output.path,
                routes: this.routes,
                postProcess: (renderedRoute) => {
                    
                    renderedRoute.html = this.transform(renderedRoute.html)

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