# Stratégie d'Abonnement & Intégration RevenueCat

Voici le plan de monétisation révisé, intégrant des limites quotidiennes strictes pour les fonctionnalités AI coûteuses (Gemini) et des quotas de stockage pour le Cloud.

## 1. Philosophie "Freemium"

L'objectif est de permettre une utilisation quotidienne basique (1 repas par jour) gratuitement, mais de débloquer le confort total pour les utilisateurs réguliers.

*   **Vérification Stricte des Ingrédients** : ✅ **Incluse pour TOUS**. La fiabilité n'est pas une option payante. L'algorithme vérifie toujours rigoureusement le frigo.

## 2. Tableau Comparatif des Tiers

| Fonctionnalité | 👨‍🍳 Chef Amateur (Gratuit) | 🏆 Sous-Chef Pro (Premium) |
| :--- | :--- | :--- |
| **Scanner de Recette (Feed)** | **1 / jour** | **Illimité** |
| **Création par Photo (AI)** | **1 / jour** | **Illimité** |
| **Import de PDF** | **Max 10 (Total)** | **Illimité** |
| **Gestion du Frigo** | Illimitée | Illimitée |
| **Mode Vérification** | Strict (Standard) | Strict (Standard) |
| **Publicité** | (Optionnel: Oui) | Non |

## 3. Détails des Limites

### 1. Scanner de Recette (Feed)
*   **Gratuit** : L'utilisateur peut scanner une URL (TikTok/Instagram) ou une photo une seule fois par 24h. C'est suffisant pour tester l'app ou cuisiner ponctuellement.
*   **Premium** : Aucune friction, scannez autant de recettes que vous voulez pour planifier la semaine.

### 2. Création de Recette AI (`app/create.tsx`)
*   **Gratuit** : La génération de recette complète à partir d'une simple photo d'ingrédients ou de plat est limitée à 1 par jour.
*   **Premium** : Illimité. Idéal pour ceux qui veulent digitaliser leur livre de cuisine perso.

### 3. Gestion des PDF
*   **Gratuit** : Stockage limité à **10 recettes PDF** au total. Au-delà, il faut supprimer ou passer Premium.
*   **Premium** : Stockage illimité. Transformez l'app en votre bibliothèque de cuisine complète.

## 4. Pricing Suggéré

| Plan | Prix | Argument de vente |
| :--- | :--- | :--- |
| **Mensuel** | **4,99 € / mois** | "Débloquez la cuisine illimitée." |
| **Annuel** | **39,99 € / an** | "2 mois offerts. Rentabilisé en quelques scans." |

---

## 5. Plan Technique (RevenueCat)

### Phase 1 : Configuration
1.  Créer un projet sur **RevenueCat**.
2.  Configurer les produits : `kitchen_monthly`, `kitchen_yearly`.
3.  Lier les clés API dans `.env`.

### Phase 2 : Entitlements & Paywalls
1.  **Entitlement** : `pro_access`.
2.  **Paywall** : Déclenché quand une limite est atteinte (ex: clic sur "Scanner" alors que quota = 0).

### Phase 3 : Suivi des Quotas (Local + Supabase)
Pour les limites quotidiennes (1/jour), nous pouvons utiliser `AsyncStorage` (reset à minuit) pour une implémentation simple et privacy-friendly, ou Supabase si on veut éviter la "triche" (désinstaller/réinstaller).
*   *Suggestion* : Commencer par **AsyncStorage** pour la simplicité (UX fluide).
*   Pour les PDF (Max 10), c'est une vérification **Base de Données** (Count `user_recipes` where `type`='pdf').
