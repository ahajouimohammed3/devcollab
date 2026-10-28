import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Définir les pages publiques qui ne nécessitent pas de connexion
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/'
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Ignorer les fichiers internes de Next.js et les fichiers statiques, sauf s'ils sont trouvés dans les paramètres de recherche
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|png|jpg|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Toujours exécuter le middleware pour les routes API
    '/(api|trpc)(.*)',
  ],
}