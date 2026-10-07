import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Article } from '../types/article';
import { INITIAL_ARTICLES } from '../data/defaultArticles';

const ARTICLES_COLLECTION = 'articles';

export async function fetchArticlesFromFirestore(): Promise<Article[]> {
  try {
    const q = query(collection(db, ARTICLES_COLLECTION), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return INITIAL_ARTICLES;
    }
    const articles: Article[] = [];
    snapshot.forEach((docSnap) => {
      articles.push(docSnap.data() as Article);
    });
    return articles;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, ARTICLES_COLLECTION);
    return INITIAL_ARTICLES;
  }
}

export function subscribeArticles(
  onUpdate: (articles: Article[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(collection(db, ARTICLES_COLLECTION), orderBy('order', 'asc'));
  
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(INITIAL_ARTICLES);
      } else {
        const items: Article[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as Article);
        });
        onUpdate(items);
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, ARTICLES_COLLECTION);
      } catch (err) {
        if (onError && err instanceof Error) onError(err);
      }
      // Provide local fallback on network error/permission
      onUpdate(INITIAL_ARTICLES);
    }
  );

  return unsubscribe;
}

export async function saveArticle(article: Article): Promise<void> {
  const docRef = doc(db, ARTICLES_COLLECTION, article.id);
  try {
    await setDoc(docRef, {
      ...article,
      updatedAt: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ARTICLES_COLLECTION}/${article.id}`);
  }
}

export async function deleteArticle(articleId: string): Promise<void> {
  const docRef = doc(db, ARTICLES_COLLECTION, articleId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ARTICLES_COLLECTION}/${articleId}`);
  }
}

export async function seedInitialArticles(): Promise<number> {
  let seededCount = 0;
  for (const art of INITIAL_ARTICLES) {
    const docRef = doc(db, ARTICLES_COLLECTION, art.id);
    try {
      await setDoc(docRef, art, { merge: true });
      seededCount++;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${ARTICLES_COLLECTION}/${art.id}`);
    }
  }
  return seededCount;
}
