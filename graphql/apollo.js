// Apollo (Elysia @elysiajs/apollo) wiring for the GraphQL API.
// The original resolvers were written as rootValue functions that receive
// `args` as the first argument (express-graphql convention). Apollo passes
// `(parent, args)`, so we map each into a Query resolver.
import { WSAPIresolvers } from "./resolver/index.js";

const rewrap = (fn) => (parent, args) => fn(args ?? {});

export const apolloResolvers = {
	Query: {
		hello: rewrap(WSAPIresolvers.hello),
		waktuSolat: rewrap(WSAPIresolvers.waktuSolat),
		getSurahNames: rewrap(WSAPIresolvers.getSurahNames),
		getOneSurah: rewrap(WSAPIresolvers.getOneSurah),
		getOneAyat: rewrap(WSAPIresolvers.getOneAyat),
		randomAyatOfQuran: rewrap(WSAPIresolvers.randomAyatOfQuran),
	},
};