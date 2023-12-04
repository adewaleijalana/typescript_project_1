import { join, resolve as _resolve } from 'path'

export const entry = './src/app.ts'
export const mode = 'development'
export const devServer = {
    static: [
        {
            directory: join(__dirname),
        },
    ],
}
export const output = {
    filename: 'bundle.js',
    path: _resolve(__dirname, 'dist'),
    publicPath: '/dist/',
}
export const devtool = 'inline-source-map'
export const module = {
    rules: [
        {
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }
    ]
}
export const resolve = {
    extensions: ['.ts', '.js']
}