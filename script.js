const books = [];
const renderEvent = "render-book";
const saveEvent = "saved-book";
const storageKey = "BOOKS_APPS";

// mengecek ada/tidaknya web storage
function isStorageExist() {
    if(typeof(Storage) === "undefined") {
        alert("Browser kamu tidak mendukung web storage");
        return false;
    } else {
        return true;
    }
}

// menyiapkan listener ketika document di load
document.addEventListener("DOMContentLoaded", function() {
    const inputBook = document.getElementById("inputBook");
    const findMyBook = document.getElementById("searchBook");

    inputBook.addEventListener("submit", function(event) {
        event.preventDefault();
        addBook();
    });

    findMyBook.addEventListener("submit", function(event) {
        event.preventDefault();
        searchBook();
    })

    if(isStorageExist()) {
        loadDataFromStorage();
    }
});

// menambahkan data buku
function addBook() {
    const bookTitle = document.getElementById("inputBookTitle").value;
    const bookAuthor = document.getElementById("inputBookAuthor").value;
    const bookYear = parseInt(document.getElementById("inputBookYear").value);
    const bookID = +new Date();

    const bookObject = generateBookObject(bookID, bookTitle, bookAuthor, bookYear, false);
    books.push(bookObject);

    document.dispatchEvent(new Event(renderEvent));
    saveBook();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

document.addEventListener(renderEvent, function() {
    const incompletedRead = document.getElementById("incompleteBookshelfList");
    incompletedRead.innerHTML = "";

    const completedRead = document.getElementById("completeBookshelfList");
    completedRead.innerHTML = "";

    for(bookItem of books) {
        const bookElement = inputShelf(bookItem);

        if(bookItem.isCompleted == false) {
            incompletedRead.append(bookElement);
        } else {
            completedRead.append(bookElement);
        }
    }
});

function inputShelf(bookObject) {
    const textTitle = document.createElement("h3");
    textTitle.innerText = bookObject.title;

    const textAuthor = document.createElement("p");
    textAuthor.innerText = "Penulis: " + bookObject.author;

    const textYear = document.createElement("p");
    textYear.innerText = "Tahun: " + bookObject.year;

    const container = document.createElement("article");
    container.classList.add("book_item");
    container.append(textTitle, textAuthor, textYear);
    container.setAttribute("id", `book-${bookObject.id}`);

    
    if(bookObject.isCompleted) {
        const finishedButton = document.createElement("button");
        finishedButton.classList.add("green");
        finishedButton.innerText = "Belum selesai dibaca"
        finishedButton.addEventListener("click", function() {
            finishedReadBook(bookObject.id);
        });
        
        const trashButton = document.createElement("button");
        trashButton.classList.add("red");
        trashButton.innerText = "Hapus buku";
        trashButton.addEventListener("click", function() {
            deleteBookFromShelf(bookObject.id);
        });
    
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("action");
        buttonContainer.append(finishedButton, trashButton);
        container.append(buttonContainer);
    } else {
        const unfinishedButton = document.createElement("button");
        unfinishedButton.classList.add("green");
        unfinishedButton.innerText = "Selesai dibaca"
        unfinishedButton.addEventListener("click", function() {
            unfinishedReadBook(bookObject.id);
        });
        
        const trashButton = document.createElement("button");
        trashButton.classList.add("red");
        trashButton.innerText = "Hapus buku";
        trashButton.addEventListener("click", function() {
            deleteBookFromShelf(bookObject.id);
        });
    
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("action");
        buttonContainer.append(unfinishedButton, trashButton);
        container.append(buttonContainer);
    }

    return container;
}

// menghapus buku
function deleteBookFromShelf(bookId) {
    const bookTarget = findBookIndex(bookId);

    const konfirmasi = document.querySelector(".konfirmasi");
    konfirmasi.removeAttribute("hidden");
    
    
    const yakin = document.createElement("button");
    yakin.classList.add("green");
    yakin.innerText = "Yakin";
    yakin.addEventListener("click", function() {
        books.splice(bookTarget, 1);
        
        document.dispatchEvent(new Event(renderEvent));
        saveBook();
        
        window.location.reload();
    });
    
    const batal = document.createElement("button");
    batal.classList.add("red");
    batal.innerText = "Batal";
    batal.addEventListener("click", function() {
        if(bookTarget === -1) return;
        
        document.dispatchEvent(new Event(renderEvent));
        saveBook();
        
        window.location.reload();
    });
    
    const tombol = document.createElement("div");
    tombol.classList.add("action");
    tombol.append(yakin, batal);

    konfirmasi.append(tombol);
}

function findBookIndex(bookId) {
    for(index in books) {
        if(books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

// memindahkan buku dari rak selesai dibaca ke belum selesai dibaca
function unfinishedReadBook(bookId) {
    const bookTarget = findBook(bookId);
    if(bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(renderEvent));
    saveBook();
}

// memindahkan buku dari rak belum selesai dibaca ke selesai dibaca
function finishedReadBook(bookId) {
    const bookTarget = findBook(bookId);
    if(bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(renderEvent));
    saveBook();
}

function findBook(bookId) {
    for(bookItem of books) {
        if(bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

// menyimpan data ke local storage
function saveBook() {
    if(isStorageExist) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(storageKey, parsed);
        document.dispatchEvent(new Event(saveEvent));
    }
}

document.addEventListener(saveEvent, function() {
    console.log("Data berhasil disimpan");
});

// mengambil data dari local storage
function loadDataFromStorage() {
    const serializedData = localStorage.getItem(storageKey);

    let data = JSON.parse(serializedData);

    if(data !== null) {
        for(book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(renderEvent));
}