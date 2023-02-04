## Description

This is a simple tic-tac-toe game written in Next.js using vercel serverless functions with a mongoDB atlas integration. It gives players the option to play either in offline mode against the computer or a friend, or in online mode against other players. Both the main page and offline tic-tac-toe page are statically generated, while the online tic-tac-toe page uses dynamic routing and getServerSideProps to fetch data from Mongo DB. The game page itself uses CSS modules for sturcturing , and the entire game page is exported as a component to the offline mode or online mode page.

### Offline Mode

The tic-tac-toe bot uses an implementation of the miniMax algorithm with alpha beta pruning, with a set of heuristics used to evaluate the base cases of the decision tree. Offline mode also implements a dark-mode switch using the usehooks-ts module to toggle and persist the prefered color scheme on the device.

### Online Mode

Online mode makes use of a CRUD API written as a Next serverless function, integrated with mongoDB atlas using the mongoDB driver. The api processes query requests and HTTP methods to determines whether to create a new game room, update the room, or delete the room, while the database is configured with a TTL index that deletes room after 10minutes. The room id and user ids for authntication are generated using the crypto module. To fetch the opponent move, the website uses short polling to continuously ping the api at one second intervals. Though inefficient, I feel that it is the better alternative compared to keeping the API running constantly with long polling. I will discuss better potential solutions in the section below.
