//HTTP request get,get/id,post,put/id, delete/id
let currentID = null;
async function LoadData() {
    try {
        let res = await fetch('http://localhost:3000/posts');
        let posts = await res.json()
        let body = document.getElementById("table-body");
        body.innerHTML = "";
        for (const post of posts) {
            const rowClass = post.isDeleted ? "deleted-row" : "";
            const buttonLabel = post.isDeleted ? "Restore" : "Delete";
            const buttonAction = post.isDeleted ? `Restore(${post.id})` : `Delete(${post.id})`;
            body.innerHTML += `<tr class='${rowClass}' style="${post.isDeleted ? 'background-color: #f8d7da;' : ''}">
                <td>${post.id}</td>
                <td>${post.title}</td>
                <td>${post.views}</td>
                <td>
                    <input type='submit' value='${buttonLabel}' onclick='${buttonAction}'/>
                </td>
            </tr>`
        }
        return false;
    } catch (error) {
        console.log(error);
    }

}//

async function getNextId() {
    let res = await fetch('http://localhost:3000/posts');
    let posts = await res.json();
    if (posts.length === 0) return "1";
    
    let maxId = Math.max(...posts.map(p => parseInt(p.id)));
    return (maxId + 1).toString();
}

async function Save() {    
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("view_txt").value;

    if (!title) {
        alert("Vui lòng nhập tiêu đề!");
        return;
    }

    if (currentID) {
        //co item->put
        let res = await fetch('http://localhost:3000/posts/' + currentID,
            {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    {
                        title: title,
                        views: views,
                        isDeleted: false
                    }
                )
            })
        if (res.ok) {
            console.log("Edit dữ liệu thành công");
        }

    } else {
        let autoID = await getNextId(); 
        let res = await fetch('http://localhost:3000/posts',
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    {
                        id: autoID,
                        title: title,
                        views: views,
                        isDeleted: false
                    }
                )
            })
    }
    if (res.ok) {
        console.log("Thêm dữ liệu thành công");
    }
    LoadData();

}
async function Delete(id) {
    let res = await fetch('http://localhost:3000/posts/' + id, {
        method: 'PATCH',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    {
                        isDeleted: true
                    }
                )
    });
    if (res.ok) {
        console.log("Xóa thành công");
    }
    LoadData();
}
async function Restore(id) {
    let res = await fetch('http://localhost:3000/posts/' + id, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: false })
    });
    
    if (res.ok) {
        console.log("Khôi phục thành công:", id);
        LoadData();
    }
}
LoadData();


// Comment CRUD
let currentCommentID = null
async function LoadComments() {
    try {
        let res = await fetch('http://localhost:3000/comments');
        let comments = await res.json();
        let body = document.getElementById("comment-table-body");
        body.innerHTML = "";

        for (const comment of comments) {
            const rowClass = comment.isDeleted ? "deleted-row" : "";
            const isDeletedText = comment.isDeleted ? "Đã xóa" : "Hiển thị";
            
            const deleteAction = comment.isDeleted ? 
                                 `<button onclick="RestoreComment('${comment.id}')">Restore</button>` : 
                                 `<button onclick="DeleteComment('${comment.id}')">Delete</button>`;
            
            const editAction = !comment.isDeleted ? 
                               `<button onclick="EditComment('${comment.id}')">Edit</button>` : 
                               ``;

            body.innerHTML += `
                <tr class='${rowClass}' style="${comment.isDeleted ? 'background-color: #f8d7da;' : ''}">
                    <td>${comment.id}</td>
                    <td>${comment.text}</td>
                    <td>${comment.postId}</td>
                    <td>${isDeletedText}</td>
                    <td>
                        ${editAction}
                        ${deleteAction}
                    </td>
                </tr>`;
        }
    } catch (error) {
        console.log("Lỗi tải comments:", error);
    }
}

async function getNextCommentId() {
    let res = await fetch('http://localhost:3000/comments');
    let comments = await res.json();
    if (comments.length === 0) return "1";
    
    let maxId = Math.max(...comments.map(c => parseInt(c.id)));
    return (maxId + 1).toString();
}

async function SaveComment() {
    let text = document.getElementById("comment_text_txt").value;
    let postId = document.getElementById("comment_postid_txt").value;

    if (!text) {
        alert("Vui lòng nhập nội dung comment!");
        return;
    }

    let response; 

    if (currentCommentID) {
        response = await fetch(`${'http://localhost:3000/comments'}/${currentCommentID}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: text,
                postId: postId,
                isDeleted: false 
            })
        });
        
        if (response.ok) {
            console.log("Cập nhật comment thành công");
            currentCommentID = null; 
        }
    } else {
        let autoID = await getNextCommentId();
        response = await fetch('http://localhost:3000/comments', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: autoID,
                text: text,
                postId: postId,
                isDeleted: false
            })
        });

        if (response.ok) {
            console.log("Thêm comment thành công");
        }
    }

    ClearCommentForm();
    LoadComments();
}

async function EditComment(id) {
    try {
        let res = await fetch(`${'http://localhost:3000/comments'}/${id}`);
        let comment = await res.json();
        
        document.getElementById("comment_text_txt").value = comment.text;
        document.getElementById("comment_postid_txt").value = comment.postId;
        
        currentCommentID = comment.id;
    } catch (error) {
        console.log(error);
    }
}

function ClearCommentForm() {
    document.getElementById("comment_text_txt").value = "";
    document.getElementById("comment_postid_txt").value = "";
    currentCommentID = null;
}

async function DeleteComment(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa comment này?")) return;

    let res = await fetch(`${'http://localhost:3000/comments'}/${id}`, {
        method: 'PATCH', 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: true })
    });

    if (res.ok) {
        console.log("Xóa comment thành công (Soft delete)");
        LoadComments();
    }
}

async function RestoreComment(id) {
    let res = await fetch(`${'http://localhost:3000/comments'}/${id}`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: false })
    });

    if (res.ok) {
        console.log("Khôi phục comment thành công");
        LoadComments();
    }
}

LoadComments();