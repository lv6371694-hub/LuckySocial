<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Lucky Social</title>

<style>
body{
margin:0;
font-family:Arial,sans-serif;
background:#18191A;
color:#fff;
}
.header{
background:#242526;
padding:15px;
text-align:center;
font-size:28px;
font-weight:bold;
color:#ff2e92;
}
.container{
max-width:600px;
margin:20px auto;
padding:10px;
}
.card{
background:#242526;
padding:15px;
border-radius:12px;
margin-bottom:20px;
}
textarea,input{
width:100%;
padding:10px;
margin:8px 0;
border:none;
border-radius:8px;
}
button{
padding:10px 20px;
background:#ff2e92;
color:#fff;
border:none;
border-radius:8px;
cursor:pointer;
}
.post{
background:#3A3B3C;
padding:15px;
border-radius:12px;
margin-top:15px;
}
img{
width:100%;
border-radius:10px;
margin-top:10px;
}
</style>

</head>
<body>

<div class="header">Lucky Social 🚀</div>

<div class="container">

<div class="card">

<h2>Create Post</h2>

<form action="/post" method="POST" enctype="multipart/form-data">

<textarea
name="text"
placeholder="What's on your mind?"
required></textarea>

<input type="file" name="photo">

<button type="submit">Post</button>

</form>

</div>

<div id="feed"></div>

</div>

<script>
async function loadPosts(){

const res = await fetch("/api/posts");
const posts = await res.json();

let html="";

posts.forEach(post=>{

html += `
<div class="post">

<h3>${post.user}</h3>

<p>${post.text}</p>

${post.image ? `<img src="${post.image}">` : ""}

<p>❤️ ${post.likes} Likes</p>

</div>
`;

});

document.getElementById("feed").innerHTML = html;

}

loadPosts();
</script>

</body>
</html>
