const importAll = (context) => context.keys().map(context);

const chapters = [
    {title: "Chapter 1", pages: importAll(require.context('./assets/chapters/chapter1', false, /\.(jpg)$/))},
    {title: "Chapter 2", pages: importAll(require.context('./assets/chapters/chapter2', false, /\.(jpg)$/))},
];

let storyDescription = 'Italian brainrot is an Internet meme that emerged in early 2025, characterized by absurd photos of AI-generated creatures with pseudo-Italian names.[1][2] The phenomenon quickly spread across social media platforms such as TikTok and Instagram, thanks to its combination of synthesized "Italian" voiceovers, grotesque as well as funny visuals, and nonsensical narrative.'

export const updateStoryDescription = (newDescription) => {
    storyDescription = newDescription;
};

export default chapters;
export { storyDescription };
