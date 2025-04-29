const importAll = (context) => context.keys().map(context);

const chapters = [
    {title: "Chapter 1: Blah Blah", pages: importAll(require.context('./assets/chapters/chapter1', false, /\.(jpg)$/))},
    {title: "Chapter 2: Goo Goo Ga Ga", pages: importAll(require.context('./assets/chapters/chapter2', false, /\.(jpg)$/))},
];

export default chapters;