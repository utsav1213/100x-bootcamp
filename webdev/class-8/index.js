const express = require("express");
const jwt = require('jsonwebtoken');
const { authMiddleware } = require("./middleware");

let USERS_ID = 1;
let ORGANIZATION_ID = 1;
let BOARD_ID = 1;
let ISSUSE_ID = 1;

const USERS = [];
const ORGANIZATIONS = [];
const BOARDS = [];
const ISSUES = [];
const app = express();
app.use(express.json());
//CREATE

app.post("/signup", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const userExists = USERS.find(u => u.username === username);
    if (userExists) {
        res.status(411).json({
            message:"User with username is already exist."
        })
    }
    USERS.push({
        username,
        password,
        id: USERS_ID++
    })
    res.json({
        message:"You have signed up successfully"
    })
})

app.get("/signin", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const userExists = USERS.find(u => u.username === username && u.password===password);
    if (!userExists) {
        res.status(403).json({
          message: "Invalid credentials",
        });
    }
    const token = jwt.sign({
        userId: userExists.id
    },"utsav is a genestaar")
    res.json({
    token
})

})


app.post("/organization", authMiddleware, (req, res) => {
    const userId = req.userId;
    ORGANIZATIONS.push({
      id: ORGANIZATION_ID++,
      title: req.body.title,
      description: req.body.description,
      admin: userId,
      members: [],
    });
    res.json({
      message: "org created",
      id: ORGANIZATION_ID - 1,
    });
})

app.post("/add-member-to-organization", authMiddleware, (req, res) => {
    const userId = req.userId;
        const organizationId = req.body.organizationId;
    const memerUserUsername = req.body.memerUserUsername;
    const organization = ORGANIZATIONS.find(org => org.id === organizationId);

    if (!organization || organization.admin !== userId) {
      res.status(411).json({
        message:
          "Either this org doesnt exist or you are not an admin of this org",
      });
      return;
    }
    const memberUser = USERS.find((u) => u.username === memerUserUsername);
    if (!memberUser) {
      res.status(411).json({
        message: "No user with this username exists in our db",
      });
      return;
    }
organization.members.push(memberUser.id)
  res.json({
    message: "New member added!",
  });
});

app.post("/board", (req, res) => {});

app.post("/issue", (req, res) => {});
app.get("/organization", authMiddleware, (req, res) => {
    const userId = req.userId;
    const organizationId = parseInt(req.query.organizationId);
    const organization = ORGANIZATIONS.find(org => org.id === organizationId);
      if (!organization || organization.admin !== userId) {
        res.status(411).json({
          message:
            "Either this org doesnt exist or you are not an admin of this org",
        });
        return;
    } 
    
        res.json({
            organization: {
                ...organization,
                members: organization.members.map(memberId => {
                    const user = USERS.find(user => user.id === memberId);
                    return {
                        id: user.id,
                        username: user.username
                    }
                })
            }
        })
})

app.get("/boards", (req, res) => {

    
})

app.get("/issues", (req, res) => {
    
})

app.get("/members", (req, res) => {

})


// UPDATE
app.put("/issues", (req, res) => {

})

//DELETE -- FIND THE GBUG and fix it
app.delete("/members", authMiddleware, (req, res) => {
    const userId = req.userId;
    const organizationId = req.body.organizationId;
    const memerUserUsername = req.body.memberUserUsername;

    const organization = ORGANIZATIONS.find(org => org.id === organizationId);

    if (!organization || organization.admin !== userId) {
        res.status(411).json({
            message: "Either this org doesnt exist or you are not an admin of this org"
        })
        return
    }

    const memberUser = USERS.find(u => u.username === memerUserUsername);

    if (!memberUser) {
        res.status(411).json({
            message: "No user with this username exists in our db"
        })
        return
    }

    organization.members = organization.members.filter(user => user.id !== memberUser.id);

    res.json({
        message: "member deleted!"
    })
})






app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

