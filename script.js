async function login() {

const username = document.getElementById("username").value;
const password = document.getElementById("password").value;

const res = await fetch("/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
username,
password
})
});

const data = await res.json();

if(data.success){

document.getElementById("loginBox").style.display="none";
document.getElementById("feed").style.display="block";

loadPosts();

}else{

document.getElementById("msg").innerHTML=data.message;

}

}

async function signup(){

const username=prompt("Choose Username");
const password=prompt("Choose Password");

if(!username||!password)return;

const res=await fetch("/signup",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
username,
password
})

});

const data=await res.json();

alert(data.message);

}

async function loadPosts(){

const res=await fetch("/api/posts");

const posts=await res.json();

let html="";

posts.forEach(post=>{

html+=`

<div class="post">

<h3>${post.user}</h3>

<p>${post.text}</p>

<button onclick="likePost('${post.id}')">
❤️ ${post.likes}
</button>

</div>

`;

});

document.getElementById("posts").innerHTML=html;

}

async function likePost(id){

await fetch("/api/posts/"+id+"/like",{

method:"POST"

});

loadPosts();

}

async function createPost(){

const text=document.getElementById("postText").value;

if(text==="") return;

await fetch("/api/posts",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

user:"You",

text:text

})

});

document.getElementById("postText").value="";

loadPosts();

}
