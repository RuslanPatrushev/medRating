const URL = 'https://json.medrating.org/';
let xhr = new XMLHttpRequest();
let openUserAlbumList = [];
let openImgList = [];
let favoriteImgList = [];
let isOpenFavoritesPage = false;
let users;

function request(requestBody) {
    xhr.open('GET', URL + requestBody, false);
    xhr.send();
    return JSON.parse(xhr.response);
}

function isOpen(nameList, userId) {
    return !!eval(nameList).find(id => id == userId);
}

function isFavorite(userImg) {
    return !!favoriteImgList.find(img => img.id == userImg.id);
}

function createContainerUserList() {
    let containerUserList = '';
    jQuery.each(users, function (i, user) {
        containerUserList +=
            `<div id=user${user.id}>
                <div class="user-name" onclick="openCloseAlbumList(${user.id})">
                    <img class='open-close-img' src='img/next.svg'/>
                    ${user.name}
                </div>
                <div class='user-album-list'></div>
            </div>`;
    });
    $('#users').html(containerUserList);
}

function createContainerAlbumList(albumList, userId) {
    let containerAlbumList = "";
    jQuery.each(albumList, function (i, album) {
        containerAlbumList +=
            `<div id=album${album.id}> 
            <div class='album-title' onclick='openCloseImgList(${JSON.stringify(album)})'>
                <img class='open-close-img' src='img/next.svg'/>
                ${album.title} 
            </div>
            <div class=album-img-list></div>
        </div>`;

    });
    $(`#user${userId} .user-album-list`).html(containerAlbumList);
}

function createContainerImgList(imgList, containerPlace) {
    let src = ''
    let containerImgList = "";
    jQuery.each(imgList, function (i, img) {
        if (favoriteImgList && isFavorite(img)) {
            src = "img/favorite.svg"
        } else {
            src = "img/notFavorite.svg"
        }
        containerImgList +=
            `<div id=img${img.id} class="album-img">
            <img class="favorite-selector-img" onclick='addRemoveFavorite( ${JSON.stringify(img)} )' src="${src}"/>
            <img class='user-img' onclick="openModal('${img.url}')" title='${img.title}' src='${img.thumbnailUrl}'>  
        </div>`;
    });
    $(containerPlace).html(containerImgList);
}

function addRemoveFavorite(img) {
    if (!isFavorite(img)) {
        favoriteImgList.push(img);
        $(`#img${img.id} .favorite-selector-img`).attr('src', "img/favorite.svg");
    } else {
        favoriteImgList = favoriteImgList.filter(item => item.id != img.id);
        $(`#img${img.id} .favorite-selector-img`).attr('src', "img/notFavorite.svg");
        if (isOpenFavoritesPage) {
            $(`#img${img.id} `).remove();
        }
    }
    localStorage.setItem('favorite', JSON.stringify(favoriteImgList))
}

function openCloseAlbumList(userId) {
    if (!isOpen("openUserAlbumList", userId)) {
        openUserAlbumList.push(userId);
        let userIndex = users.findIndex(user => user.id == userId);
        if (!users[userIndex].albums) {
            let requestBody = `albums?userId=${userId}`;
            users[userIndex].albums = request(requestBody);
        }
        createContainerAlbumList(users[userIndex].albums, userId);
        $(`#user${userId}`).addClass('user-album-list_open');
    } else {
        openUserAlbumList = openUserAlbumList.filter(id => id != userId);
        $(`#user${userId} .user-album-list`).empty();
        $(`#user${userId}`).removeClass('user-album-list_open');
    }
}

function openCloseImgList(album) {
    if (!isOpen("openImgList", album.id)) {
        openImgList.push(album.id);
        let userIndex = users.findIndex(user => user.id == album.userId);
        let albumIndex = users[userIndex].albums.findIndex(userAlbum => userAlbum.id == album.id);
        if (!users[userIndex].albums[albumIndex].imgs) {
            let requestBody = `photos?albumId=${album.id}`;
            users[userIndex].albums[albumIndex].imgs = request(requestBody);
        }
        createContainerImgList(users[userIndex].albums[albumIndex].imgs, `#album${album.id} .album-img-list`);
        $(`#album${album.id}`).addClass('album-img-list_open');
    } else {
        openImgList = openImgList.filter(id => id != album.id);
        $(`#album${album.id} .album-img-list`).empty();
        $(`#album${album.id}`).removeClass('album-img-list_open');
    }
}

function openModal(url) {
    $('#imgModal img').attr('src', url)
    $('#myOverlay').fadeIn(297, function () {
        $('#imgModal')
            .css('display', 'block')
            .animate({opacity: 1}, 198);
    });
    $('#imgModal__close, #myOverlay').click(function () {
        $('#imgModal').animate({opacity: 0}, 198, function () {
            $(this).css('display', 'none');
            $('#myOverlay').fadeOut(297);
        });
    });
}

function openFavoritePage() {
    isOpenFavoritesPage = true;
    createContainerImgList(favoriteImgList, '#favoriteImg');
    $('#users').empty()
}

function openCatalogPage() {
    $("#favoriteImg").empty()
    if (!users) {
        let requestBody = "users/"
        users = request(requestBody).filter(user => user.name);
        if (localStorage.getItem('favorite')) {
            favoriteImgList = JSON.parse(localStorage.getItem('favorite'));
        }
    }
    createContainerUserList();
}

$(document).ready(function () {
    openCatalogPage();
});
