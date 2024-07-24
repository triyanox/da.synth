# Da.Synth (ダ・シンセ)

Welcome to Da.Synth, my playground for web-based synthesis! As a music producer and sound design enthusiast, I've always been fascinated by the innovative and quirky instruments from Teenage Engineering. This project is my attempt to bring some of that playful spirit into the browser.

[**Try Da.Synth Now!**](https://da-synth.achaq.dev)

⚠️ **Note**: This is very much a work in progress...

![Da.Synth Screenshot](.github/preview.jpeg)

## What's This All About?

Da.Synth is my experiment in creating a web-based synthesizer that captures the essence of boutique hardware synths. It's not trying to be a pro-level tool (at least not yet!), but rather a fun, quirky playground for sound experimentation.

## The Inspiration

As someone who loves tinkering with [Teenage Engineering](https://teenage.engineering/)'s products, I wanted to create something that captures their spirit of making music production accessible and fun. While I'm no DSP expert, I've tried to infuse some of that TE magic into this project:

- Embracing happy accidents and weird sounds
- Keeping things visually interesting (even if not always practical)
- Trying to strike a balance between simplicity and depth

### Current Features [WIP]

- A bunch of oscillators you can mess with
- Effects effects effects
- A UI that's trying its best to look cool
- The ability to save your happy accidents as presets

### Upcoming...

- Optimizing... everything [Probaby rewrite the damn thing in rust, jk 😅]

## Available Effects

Da.Synth comes with a variety of effects to shape your sound. Some are classic staples, while others are more experimental. Here's what's currently available:

### Standard Effects
1. Chorus
2. Compressor
3. Delay
4. Distortion
5. Filter
6. Flanger
7. Limiter
8. Phaser
9. Reverb
10. Stereo Widener
11. Tremolo

### Experimental Effects (*)
These effects are more experimental and may be a bit unstable:

12. Bitcrusher
13. Dimension Expander
14. Formant Filter
15. Granular
16. Ping Pong Delay
17. Sonic Transformer
18. Spectral Shaper

*Note: Effects marked with (\*) are experimental and may have bugs or unexpected behavior. But that's where the fun begins! just save relaod and try again 😅*

### Effect Chain
You can chain these effects in any order you like, creating unique and sometimes bizarre sound transformations. Feel free to experiment and find your own signature sound!



## Under the Hood

I'm building this with:
- [Next.js](https://nextjs.org/) (for the web stuff)
- [React](https://react.dev/) (for the knobs and buttons) ft. [shadcn-ui](https://ui.shadcn.com/):

  The UI is built with React, using a mix of custom components and libraries like shadcn-ui. I'm trying to keep things simple and fun, with a focus on interactivity and visual feedback.

- Web Audio API (for all the bleeps and bloops):

  I'm using the Web Audio API to handle all the audio processing. This includes generating sound waves, applying effects, and mixing everything together. It's a powerful tool that lets you create custom audio processing pipelines in the browser.

- Audio Worklets (for the heavy lifting and cool effects):

  Audio Worklets are a new-ish feature that allows you to run custom audio processing code in a separate thread. This is great for performance and opens up a lot of possibilities for creating custom audio effects and synths. (I didn't use ScriptProcessorNode because it's deprecated and I like to live on the edge.)

## Goals

- Learn more about DSP and audio programming
- Create a fun, web-based playground for sound design
- Maybe, just maybe, create something that others find interesting or useful

## Current State

This project is in its early stages, so expect bugs, missing features, and general weirdness. I'm actively working on it, so feel free to check back for updates!

## Contributing

If you're interested in contributing, feel free to fork this repo and submit a PR. I'm open to suggestions, bug reports, and any other feedback you might have. Just keep in mind that this is a personal project, so I might not be able to address everything right away but don't forget to star while you're at it! ⭐


## License

Da.Synth is open-source software licensed under the MIT license. Feel free to use it, learn from it, or laugh at it!

---

Now excuse me while I go back to twisting knobs and making weird noises! 🎶✨