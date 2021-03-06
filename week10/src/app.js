import { createServer } from 'http'

import { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageGraphQLPlayground, gql } from 'apollo-server-core'
import { ApolloServer } from 'apollo-server-express'
import cors from 'cors'
import express from 'express'
// import { buildSchema } from 'graphql'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.get('/', (req, res) => {
  res.json({ message: 'Server running' })
})

// const schema = buildSchema(`
// type Query {
//   hello (name: String!): String
// }
// `)
// const root = {
//   hello: (args) => `Hello ${args.name} from GraphQL API`,
// }
const typeDefs = gql`
type User {
  id
  name
}
type Product {
  id: String
  name: String
  price: Float
  createdBy: User
}
input ProductInput {
  name: String!
  price: Float!
}
type Query {
  hello (name: String!): String
  products: [Product]
  productId (id: String!): Product
}
type Mutation {
  addProduct (product: ProductInput): Product
  updateProduct (id: String! input: ProductInput): Product
  deleteProduct (id: String): Boolean
}
`
const resolvers = {
  Query: {
    hello: (source, args) => `Hello ${args.name} from GraphQL API`,
    products: async () => {
      const products = [{ name: 'iPhone 13 mini', price: 25_900 }, { name: 'iPhone 13', price: 29_900 }] // get from DB or API
      const productWithUser = products.map((product) => ({
        ...product,
        createdBy: { id: 1, name: 'Admin' }, // get from DB or API
      }))
      return productWithUser
    },
  },
  Mutation: {
    addProduct: async (source, args) => {
      const { product } = args
      // implement add logic
      return product
    },
  },
}

const startApolloServer = async () => {
  const httpServer = createServer(app)
  const apolloServer = new ApolloServer({
    // schema,
    // rootValue: root,
    typeDefs,
    resolvers,
    introspection: true,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  })
  await apolloServer.start()
  apolloServer.applyMiddleware({ app, path: '/graphql' })
  httpServer.listen({ port: 3001 })
}
startApolloServer()
