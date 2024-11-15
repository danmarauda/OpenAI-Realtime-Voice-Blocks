import { build } from "velite";
import dotenv from 'dotenv';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

dotenv.config();

/** @type {import('next').NextConfig} */

export default {
  // other next config here...
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      config.plugins.push(new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash].css',
        chunkFilename: 'static/css/[name].[contenthash].css',
      }));
    }
    
    // Ignore punycode warning more specifically
    config.ignoreWarnings = [
      { message: /Critical dependency: the request of a dependency is an expression/ },
      { message: /The `punycode` module is deprecated/ },
    ];
    
    // Optimize Velite plugin
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.beforeCompile.tapPromise("VelitePlugin", async () => {
          if (!VelitePlugin.started) {
            VelitePlugin.started = true;
            await build({ watch: dev, clean: !dev });
          }
        });
      }
    });
    
    // Attempt to minimize Velite plugin warnings
    config.module.rules.push({
      test: /velite-.*\.js$/,
      loader: 'ignore-loader'
    });
    
    return config;
  },
};

class VelitePlugin {
  static started = false;
}
