let myLibrary = [];

function book(title, author, pages, isRead){
    this.title = trimWord(title);
    this.author = trimWord(author);
    this.pages = trimWord(pages);
    this.isRead = isRead ? true : false;

    this.info = () =>{
        return `${this.title} by ${this.author}, ${this.pages} pages, ${this.isRead}`;
    }
}

function clearLibrary(){
    let books = Array.from(document.querySelectorAll(".card"));
    let library = document.querySelector(".library");
    books.forEach(obj => library.removeChild(obj));
}

function trimWord(word){
    let regex = /[\w ]{25,}/g;
    if(!regex.test(word)) return word;
    let newWord = word.split("").slice(0, 25);
    newWord.push("...");
    newWord = newWord.join("");
    return newWord;
}

function setBookCompletion(bookObj, checkBox){
    bookObj.isRead = checkBox.checked;
    checkBox.classList.toggle("is-read--selected");
    updateStorage();
}

function getLibraryJSON(){
    let jsonText = '{ "books":[';

    for(let i = 0; i < myLibrary.length; i++){
        jsonText += `{
            "title":"${myLibrary[i].title}",
            "author":"${myLibrary[i].author}",
            "pages":"${myLibrary[i].pages}",
            "isRead":"${myLibrary[i].isRead}"
        }`;

        if(i != myLibrary.length - 1){
            jsonText += ',';
        }
    }
    jsonText += ']}';

    return jsonText;
}

function retrieveLibraryJSON(){
    let jsonText = localStorage.getItem('library');
    let jsonObj = JSON.parse(jsonText);
    return jsonObj;
}

function libraryJSONToPage(json){
    json["books"].forEach(obj => {
        createNewBookCard(obj.title, obj.author, obj.pages, obj.isRead);
    });
}

function updateStorage(){
    localStorage.setItem('library', getLibraryJSON());
}

function toggleAddMenu(){
    let popupMenu = document.querySelector(".popup-form");
    let bookForm = document.querySelector(".book-form");
    let btnIcon = document.querySelector(".add-btn > #btn-text");

    btnIcon.textContent = btnIcon.textContent == "+" ? "-" : "+";

    popupMenu.classList.toggle("invisible");
    bookForm.reset();
}

function addBookToLibrary(bookObj){
    let library = document.querySelector(".library");
    myLibrary.push(bookObj);

    // Add card to element
    library.appendChild(createCard(bookObj));
    updateStorage();
}

function removeBook(bookObj, card){
    let index = myLibrary.findIndex((book)=>book.title === bookObj.title);
    let library = document.querySelector(".library");
    library.removeChild(card);
    myLibrary.splice(index, 1);
    updateStorage();
}

function createCard(book){
    let card = document.createElement('div');

    let remove = document.createElement('button');

    let cardContent = document.createElement('div');

    let title = document.createElement('h2');
    let author = document.createElement('h3');
    let pages = document.createElement('p');
    let isRead = document.createElement('input');

    // Add Content
    remove.textContent = "X";
    title.textContent = book.title;
    author.textContent = "by " + book.author;
    pages.textContent = book.pages + " pg";
    
    isRead.setAttribute("type", "checkbox");

    // Create Hierarchy
    cardContent.appendChild(title);
    cardContent.appendChild(author);
    cardContent.appendChild(pages);

    card.appendChild(remove);
    card.appendChild(cardContent);
    card.appendChild(isRead);
    
    // Add styling
    card.classList.add("card");

    cardContent.classList.add("card__content");
    cardContent.classList.add("container");

    remove.classList.add("remove")

    title.classList.add("title");

    author.classList.add("author");

    pages.classList.add("pages");

    isRead.classList.add("is-read");
    if(book.isRead){
        isRead.classList.toggle("is-read--selected");
        isRead.setAttribute("checked", true);
    }

    // Add Event Listeners
    isRead.addEventListener('change', ()=>setBookCompletion(book, isRead));
    remove.addEventListener('click', ()=>removeBook(book, card));

    return card;
}

function displayInitialLibrary(){
    clearLibrary();
    let library = document.querySelector(".library");
    
    if(myLibrary.length == 0) return;

    for(let i = 0; i < myLibrary.length; i++){
        library.appendChild(createCard(myLibrary[i]));
    }
}

function populateFromStorage(){
    libraryJSONToPage(retrieveLibraryJSON());
    displayInitialLibrary();
}

// Updating page based on stored data
function initializeStorage(){
    // Test if already populated first, if not, set initial
    if(!localStorage.getItem('library')){
        localStorage.setItem('library', getLibraryJSON());
    } else {
        // Else fill page with stored data
        populateFromStorage();
    }
}

function submitBookCardForm(eventInfo){
    eventInfo.preventDefault();
    let formTitle = document.querySelector(".book-form > input[name='title']");
    let formAuthor = document.querySelector(".book-form > input[name='author']");
    let formPages = document.querySelector(".book-form > input[name='pages']");
    let formRead = document.querySelector(".book-form > input[name='read']");
    createNewBookCard(formTitle.value, formAuthor.value, formPages.value, formRead.checked);
    toggleAddMenu();
}

function createNewBookCard(formTitle, formAuthor, formPages, formRead){
    if(typeof(formRead) == 'string'){
        formRead = formRead == "true" ? true:false;
    }
    let newBook = new book(formTitle, formAuthor, formPages, formRead);
    addBookToLibrary(newBook);
}

// Local Storage Testing Function
function storageAvailable(type){
    var storage;
    try{
        // Test for the storage object 'localStorage' or 'sessionStorage'
        storage = window[type];
        storage.setItem('key', 'value');
        storage.removeItem('key');
        return true;
    }catch(e){
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // minus Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // only aknowledging QuotaExceededError if there exists an item already stored
            (storage && storage.length !== 0);
    }
}

// Testing Local Storage
if(storageAvailable('localStorage')){
    if(document.querySelector(".card") == null) {
        initializeStorage();
    }
    }else{
    // Storage not available
}

let bookForm = document.querySelector(".book-form");
bookForm.addEventListener("submit", submitBookCardForm);

let addCardBtn = document.querySelector(".add-btn");
addCardBtn.addEventListener("click", toggleAddMenu);