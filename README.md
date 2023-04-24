# Higher
## File-based HTTP router
&nbsp;

Higher was built thinking in some requirements
- The minimum of code lines to create an endpoint
- Files with a unique responsibilty, representing a unique endpoint
- Easy to test
- Performance
- Good developer experience

&nbsp;

has support to:
- 🔄 Middlewares (per folder level)
- ✅ Body and query params validation (using Zod)
- ⤵ Dependency injection (Test is very easy)
  
&nbsp;

and was built-in using:
- Fastify
- Zod
- Typescript
- Tsup (Dev server and build process is very fast)

&nbsp;
## In pratice:

Higher follow a well defined structure, let's start with a route to retrieve users
<div style="margin-left: 30px;">
📁 src
  <div style="margin-left: 15px;">
  📁 modules
    <div style="margin-left: 15px;">
    📁 users
      <div style="margin-left: 15px;">
      📄 get.ts
      </div>
    </div>
    📄 index.ts
  </div>
</div>
<br/>

**get.ts** :

```typescript
  export handle = () => {
    return ["Kaio", "Woen"]
  }
```

**index.ts** :
```typescript
  import { bootstrap } from "@woen4/higher";

  const server = bootstrap();

  server.listen(3000)
```

On run npm higher dev, this will run your server exposing a route **/users** of method **GET**

<br/>
now let's say you need to use something to access your database in that function,

so you need create a folder **providers** in **src** directory and exports a object from there

<div style="margin-left: 30px;">
📁 src
  <div style="margin-left: 15px;">
  📁 modules
    <div style="margin-left: 15px;">
    📁 users
      <div style="margin-left: 15px;">
      📄 get.ts
      </div>
    </div>
  </div>
   <div style="margin-left: 15px;">
  📁 providers
    <div style="margin-left: 15px;">
      📄 index.ts<br/>
      📄 prisma.ts
    </div>
  </div>
</div>
<br/>

**prisma.ts** :

```typescript
  import { PrismaClient } from '@prisma/client'

  export const prisma = new PrismaClient()
```

<br/>

**index.ts** :

```typescript
  export type Providers = typeof import("./index");

  export * from './prisma'
```
<br/>

And then, use this in your route handler

**get.ts** :

```typescript
  import { Providers } from '../../providers'

  export handle = (ctx: Providers) => {
    return ctx.prisma.users.findMany()
  }
```
<br/>

But... how to acess request in handler? Simple
<br/>
**modules/users/post.ts**

```typescript
  import { Providers } from '../../providers'

  export handle = (ctx: Providers, { body }: HigherRequest) => {
    return ctx.prisma.users.create({ data: body })
  }
```

But... how to validate the body data? Also is simple

```typescript
  import { Providers } from '../../providers'
  import { z } from "zod";

  export const schema = z.object({
    name: z.string(),
    email: z.string(),
  });

  export handle = (ctx: Providers, { body }: HigherRequest<void, typeof schema>) => {
    return ctx.prisma.users.create({ data: body })
  }
```
The generic type ```<void, typeof schema>``` will offer the intellisense in your editor when using body object
<br />

Ok, but I need of a middleware to authenticate my routes, how do it?. Also is very simple
<br/>

Create a file named **middleware.ts** inside the **modules** folder and it will be apply to all routes, otherwise if you put your middleware file inside the **users** folder, it will only apply to **users** routes

<div style="margin-left: 30px;">
📁 src
  <div style="margin-left: 15px;">
  📁 modules
    <div style="margin-left: 15px;">
    📄 middleware.ts
    </div>
    <div style="margin-left: 15px;">
    📁 users
      <div style="margin-left: 15px;">
      📄 get.ts
      </div>
      <div style="margin-left: 15px;">
      📄 get.ts
      </div>
    </div>
  </div>
   <div style="margin-left: 15px;">
  📁 providers
    <div style="margin-left: 15px;">
      📄 index.ts<br/>
      📄 prisma.ts
    </div>
  </div>
</div>
<br/>

**middleware.ts**

```typescript
  import { HigherRequest, HigherResponse } from "@woen4/higher";
  import { Providers } from '../providers'

  export type WithAuth = {
    user: {
      id: string;
    };
  };

  export const handle = (ctx: Providers, request: HigherRequest<WithAuth>) => {
    /* 
    
    Some lines of code to implementate authorization

    */

    request.user = {
      id: '123',
    }
  };
```
<br />

One more question, how to create routes with parameters? Simple and plain

<div style="margin-left: 30px;">
📁 src
  <div style="margin-left: 15px;">
  📁 modules
    <div style="margin-left: 15px;">
    📄 middleware.ts
    </div>
    <div style="margin-left: 15px;">
    📁 users
      <div style="margin-left: 15px;">
      📄 get.ts
      </div>
      <div style="margin-left: 15px;">
      📄 get.ts
      </div>
      <div style="margin-left: 15px;">
      📁 [userId]
        <div style="margin-left: 15px;">
        📄 get.ts
        </div>
      </div>
    </div>
  </div>
   <div style="margin-left: 15px;">
  📁 providers
    <div style="margin-left: 15px;">
      📄 index.ts<br/>
      📄 prisma.ts
    </div>
  </div>
</div>
<br/>

**[userId]/get.ts**

```typescript
  import { Providers } from '../../providers'
  import { WithAuth } from '../../../middleware.ts'

  export handle = (ctx: Providers, { user }: HigherRequest<WithAuth>) => {
    
    return ctx.prisma.users.findFirst({ where: { id: user.id } })
  }
```