## Description

This is a simple tic-tac-toe game written in Next.js using vercel serverless functions with a mongoDB atlas integration. It gives players the option to play either in offline mode against the computer or a friend, or in online mode against other players. Both the main page and offline tic-tac-toe page are statically generated, while the online tic-tac-toe page uses dynamic routing and getServerSideProps to fetch data from Mongo DB. The game page itself uses CSS modules for sturcturing , and the entire game page is exported as a component to the offline mode or online mode page.

### Offline Mode

The tic-tac-toe bot uses an implementation of the miniMax algorithm with alpha beta pruning, with a set of heuristics used to evaluate the base cases of the decision tree. Offline mode also implements a dark-mode switch using the usehooks-ts module to toggle and persist the prefered color scheme on the device.

### Online Mode

Online mode makes use of a CRUD API written as a Next serverless function, integrated with mongoDB atlas using the mongoDB driver. The api processes query requests and HTTP methods to determines whether to create a new game room, update the room, or delete the room, while the database is configured with a TTL index that deletes room after 10minutes. The room id and user ids for authntication are generated using the crypto module. To fetch the opponent move, the website uses short polling to continuously ping the api at one second intervals. Though inefficient, I feel that it is the better alternative compared to keeping the API running constantly with long polling. I will discuss better potential solutions in the section below.

## Learning experiences

This is my first attempt to build a website from the ground up, with my only other relavant coding experience being completing part of the CS50 course, making a piano tiles autoclicker script, trying to make a website and then falling into the rabbit hole of web dev. Building this website was overwhelming but also deeply engaging. I made a lot of mistakes along the way, mistakes that I spent days debugging and mistakes that are still present in this code but I have not resolved yet. Here are the learning points that I hope to improve on in future projects:

1. **Type errors**. 
There were many instances where bugs occured due to me comparing values that were of different types, such as checking the equality of two variables eg. `foo (value=1,type int) === bar (value='1', type str)`, and expecting them to be equal. This resulted countless hours wasted chasing the bug by console logging values and types. I could have prevented this by checking the types of the variables first and not to assume their value, and to be more careful eg. (http responses are always json strings). I will explore using typescript for future projects to enforce type validity.

2. **Not reading error messages throughly**. 
There were times when the solution to bugs were in the error messages, but I missed out due to glossing over them too quickly. Lesson learnt is treat error messages with more care, and running them though tools like chatGPT to debug code.

3. **Not reading documentations fully or using leveraging existing modules**.
I misunderstood the usage of mongoDB changestreams and spent days testing out code that were simply written wrongly, which I could have solved easily if only I had read the relavant blogs, tutorials and documentations. I also wasted time building my own potentially buggy apis and custom react hooks when I could have simply imported modules such as `usehooks-ts` or refered to boilerplate crud api code to learn about better coding practices, techniques and to build more reliable code in general.

4. **Not refactoring code properly**.

5. **Not creating testing systems**.

6. **Shaky understanding of error catching**.

## Whats next?

I plan to explore deploying serverless functions such as AWS API Gateway, AWS Lambda or Cloudflare workers directly, and to try out polling alternatives such as Webhooks, Server-Sent Events, Websockets and WebRTC. I also plan to explore alternative CSS frameworks such as TailwindCSS, SASS, as well as prebuilt framworks such as MaterialUI, ChakraUI and Bootstrap. If resources and time permit, I might also try out deploying websites on web hosting providers such as Hostinger or Godaddy. There are also plenty of other stuff to learn, such as trying out alternative javascript frameworks such as SvelteKit or Angular, and learning more about databases such as mongoDB, dynamoBD, and mySQL. Beyond that, there is a host host of other technologies out the that I do not yet understand, such as the myriad of AWS or Google cloud services and even blockchain technologies and Webassembly.

## Conclusion

Its been a rough ride, but it was well worth it in the end. With dedication, I created something workable, though it may be trash compared to industry standards. I hope that this project won't be my last, and that moving on, subsequent projects will be ever more streamlined, less fragile, and more feature rich than the previous one.
