// Script pour configurer le bucket Supabase Storage pour les images de produits
// À exécuter dans la console Supabase ou via une fonction serverless

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Clé de service, pas la clé anon

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  try {
    // Créer le bucket 'products' s'il n'existe pas
    const { data: buckets } = await supabase.storage.listBuckets()

    const productsBucket = buckets.find(bucket => bucket.name === 'products')

    if (!productsBucket) {
      const { data, error } = await supabase.storage.createBucket('products', {
        public: true, // Rendre le bucket public pour accéder aux images
        allowedMimeTypes: ['image/*'], // Uniquement les images
        fileSizeLimit: 5242880 // 5MB max
      })

      if (error) {
        console.error('Erreur création bucket:', error)
        return
      }

      console.log('Bucket "products" créé avec succès')
    } else {
      console.log('Bucket "products" existe déjà')
    }

    // Configurer les politiques d'accès (optionnel mais recommandé)
    // Permettre l'upload uniquement aux utilisateurs authentifiés
    const { error: policyError } = await supabase.storage.from('products').createPolicy(
      'Users can upload their own product images',
      {
        insert: {
          allowed: {
            auth: { authenticated: true }
          }
        }
      }
    )

    if (policyError) {
      console.log('Politique déjà existante ou erreur:', policyError.message)
    }

  } catch (error) {
    console.error('Erreur setup storage:', error)
  }
}

setupStorage()