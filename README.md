# Getting Started with Crypto.com Chain

1. Fork this repository on Github
2. Clone your forked repository (not our original one) to your hard drive with `git clone https://github.com/YOURUSERNAME/chain-docs.git`
3. `cd chain-docs`
4. Initialize and start chain-docs.

```
npm install
cd docs
vuepress dev
```

You can now see the docs at http://localhost:8080.

# Adding new page to the doc

1. Create a markdown file under `/docs/getting-started/`
2. Open `/docs/.vuepress/config.js`
3. Add the file name to `sidebar` and the `ordering` under `vuepress-plugin-export` in plugins
```
module.exports = {
  ...,

  themeConfig: {
    ...,

    sidebar: {
      '/getting-started/': [
        '',
        ...,
        '[AddYourNewFileNameHere]'
        ...
      ]
    }
  },
  ...,

  plugins: [
    ['vuepress-plugin-export',
    {
      sorter: function(a,b){
        var ordering = {
          'Home': 0,
          ...,
          '[AddYourNewFileNameHere]': [AddTheNumberYouWantThePageBeOrdered]
          ...,
        };
        ...
      }
    }
    ]
  ]
}
```

Remember, place your new file name in order in sidebar.

# Deploy
