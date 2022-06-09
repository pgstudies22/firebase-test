import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js'
import { getFirestore, collection, addDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-firestore.js'
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-auth.js'

const firebaseConfig = {
  apiKey: 'AIzaSyCJfhwDe0XtRmnFE-ZldMOHSk0PrKv105M',
  authDomain: 'fir-test-95298.firebaseapp.com',
  projectId: 'fir-test-95298',
  storageBucket: 'fir-test-95298.appspot.com',
  messagingSenderId: '560349223861',
  appId: '1:560349223861:web:6bf298ee60c0d4a980d7fc',
  measurementId: 'G-FFH8VHV4LT'
}

const phrasesList = document.querySelector('[data-js="phrases-list"]')

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
const db = getFirestore(app)
const collectionPhrases = collection(db, 'phrases')

const login = async () => {
  try {
    await signInWithPopup(auth, provider)

    const modalLogin = document.querySelector('[data-modal="login"]')
    M.Modal.getInstance(modalLogin).close()
  } catch (error) {
    console.log('error:', error)
  }
}

const logout = async unsubscribe => {
  try {
    await signOut(auth)
    console.log('usuário foi deslogado')

    if (unsubscribe) {
      console.log('unsubscribe:', unsubscribe)
      unsubscribe()
    }
  } catch (error) {
    console.log('error:', error)
  }
}

const addPhrase = async e => {
  e.preventDefault()

  const addedPhrase = await addDoc(collectionPhrases, {
    movieTitle: DOMPurify.sanitize(e.target.title.value),
    phrase: DOMPurify.sanitize(e.target.phrase.value)
  })

  console.log('Document adicionado com o ID', addedPhrase.id)
  e.target.reset()
  
  const modalAddPhrase = document.querySelector('[data-modal="add-phrase"]')
  M.Modal.getInstance(modalAddPhrase).close()  
}

const getLiPhrase = ({ movieTitle, phrase }) => {
  const liPhrase = document.createElement('li')
  const movieTitleContainer = document.createElement('div')
  const phraseContainer = document.createElement('div')

  movieTitleContainer.textContent = DOMPurify.sanitize(movieTitle)
  phraseContainer.textContent = DOMPurify.sanitize(phrase)
  movieTitleContainer.setAttribute('class', 'collapsible-header blue-grey-text text-lighten-5 pink darken-4')
  phraseContainer.setAttribute('class', 'collapsible-body blue-grey-text text-lighten-5 pink darken-4')

  liPhrase.append(movieTitleContainer)
  liPhrase.append(phraseContainer)

  return liPhrase
}

const renderPhrases = snapshot => {
  const fragment = document.createDocumentFragment()
  console.log('snapshot.docChanges():', snapshot.docChanges())
  snapshot.docChanges().forEach(docChange => {
    const liPhrase = getLiPhrase(docChange.doc.data())
    fragment.append(liPhrase)
  })

  phrasesList.append(fragment)
}

const handleAuthStateChanged = user => {
  console.log(user)
  const lis = [...document.querySelector('[data-js="nav-ul"]').children]

  lis.forEach(li => {
    const liShouldBeVisible = li.dataset.js.includes(user ? 'logged-in' : 'logged-out')
    
    if (liShouldBeVisible) {
      li.classList.remove('hide')
      return
    }

    li.classList.add('hide')
  })
  
  const loginMessageExists = document.querySelector('[data-js="login-message"]')
  loginMessageExists?.remove()

  const buttonGoogle = document.querySelector('[data-js="button-google"]')
  const formAddPhrase = document.querySelector('[data-js="add-phrase-form"]')
  const linkLogout = document.querySelector('[data-js="logout"]')

  if (!user) {
    const phrasesContainer = document.querySelector('[data-js="phrases-container"]')
    const loginMessage = document.createElement('h5')

    Array.from(phrasesList.children).forEach(li => li.remove())

    loginMessage.textContent = 'Faça login'
    loginMessage.classList.add('center-align', 'white-text')
    loginMessage.setAttribute('data-js', 'login-message')
    phrasesContainer.append(loginMessage)

    buttonGoogle.addEventListener('click', login)
    formAddPhrase.removeEventListener('submit', addPhrase)
    linkLogout.removeEventListener('click', logout)
    return
  }

  const unsubscribe = onSnapshot(collectionPhrases, renderPhrases, error => console.log('Erro:', error))
  linkLogout.addEventListener('click', () => logout(unsubscribe))
  formAddPhrase.addEventListener('submit', addPhrase)
  buttonGoogle.removeEventListener('click', login)
}

const initModals = () => {
  const modals = document.querySelectorAll('[data-js="modal"]')
  M.Modal.init(modals)
}

onAuthStateChanged(auth, handleAuthStateChanged)
initModals()
