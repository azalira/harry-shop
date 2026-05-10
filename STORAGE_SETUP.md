# Configuration Supabase Storage pour l'upload d'images

## Prérequis

Assurez-vous d'avoir configuré votre projet Supabase avec les variables d'environnement suivantes dans votre fichier `.env` :

```
VITE_SUPABASE_URL=votre_supabase_url
VITE_SUPABASE_ANON_KEY=votre_supabase_anon_key
VITE_SUPABASE_STORAGE_BUCKET=products
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

## Configuration du Bucket Storage

### Méthode 1: Via le Dashboard Supabase

1. Allez dans votre [Dashboard Supabase](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans "Storage" dans le menu latéral
4. Cliquez sur "Create bucket"
5. Nommez le bucket `products`
6. Cochez "Public bucket" pour permettre l'accès public aux images
7. Configurez les paramètres :
   - Allowed MIME types: `image/*`
   - File size limit: `5242880` (5MB)

### Méthode 2: Via Script (Recommandé)

Exécutez le script de configuration :

```bash
node setup-storage.js
```

Ce script va :
- Créer le bucket `products` s'il n'existe pas
- Le configurer comme bucket public
- Restreindre les types de fichiers aux images uniquement
- Limiter la taille des fichiers à 5MB

## Fonctionnalités d'Upload d'Images

### Ajouter un Produit

Dans la page "Ajouter un produit" (`/add-product`), les vendeurs peuvent maintenant :

1. Sélectionner une image depuis leur ordinateur
2. Voir un aperçu de l'image avant publication
3. L'image est automatiquement uploadée vers Supabase Storage
4. L'URL de l'image est sauvegardée dans la base de données

### Modifier un Produit

Dans la page "Modifier le produit" (`/edit-product/:id`), les vendeurs peuvent :

1. Voir l'image actuelle du produit
2. Optionnellement uploader une nouvelle image
3. L'ancienne image reste si aucune nouvelle n'est sélectionnée
4. La nouvelle image remplace l'ancienne dans le stockage

## Sécurité

- Seuls les utilisateurs authentifiés peuvent uploader des images
- Les images sont limitées à 5MB maximum
- Seuls les types de fichiers image sont acceptés
- Les images sont stockées dans un bucket public pour un accès facile

## Structure des Fichiers

Les images sont stockées dans Supabase Storage avec la structure suivante :
```
products/
  ├── 1640995200000.jpg
  ├── 1640995300000.png
  └── ...
```

Le nom des fichiers est généré automatiquement avec un timestamp pour éviter les conflits.

## Dépannage

### Erreur "Bucket not found"
- Vérifiez que le bucket `products` existe dans votre dashboard Supabase
- Assurez-vous que le bucket est public

### Erreur "Upload failed"
- Vérifiez les permissions de votre compte Supabase
- Assurez-vous que la taille du fichier ne dépasse pas 5MB
- Vérifiez que le fichier est bien une image

### Images ne s'affichent pas
- Vérifiez que le bucket est configuré comme public
- Vérifiez l'URL générée dans la console du navigateur