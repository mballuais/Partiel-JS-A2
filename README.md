# Gestion des Commandes - Kebab

## Description

Ce projet est une application en JavaScript permettant de gérer les recettes et les commandes d'un kebabier. L'application permet de :
- Ajouter, visualiser et supprimer des recettes
- Lancer des commandes en cuisine avec la sélection d'une sauce
- Visualiser et valider les commandes en cuisine
- Afficher le temps écoulé depuis le lancement de chaque commande

Les données sont sauvegardées dans le `localStorage` pour une persistance même après un rafraîchissement de la page. L'heure de chaque commande est récupérée via l'API `TimeAPI.io` pour garantir la précision de l'heure de la commande.

## Fonctionnalités

### 1. Ajouter, visualiser et supprimer une recette
- Une recette est composée d'un nom et des ingrédients.
- Les recettes ajoutées s'affichent dans la liste.
- Il est possible de supprimer une recette de la liste et de supprimer également les commandes envoyées en cuisine liées à cette recette.

### 2. Lancer une commande en cuisine
- Une commande peut être lancée en envoyant une recette en cuisine.
- Lors de l'envoi, il est possible de sélectionner une sauce pour la commande.
- L'heure exacte de la commande est récupérée via l'API `TimeAPI.io`.

### 3. Visualiser et valider les commandes
- La liste des commandes en cuisine affiche les commandes envoyées avec leur heure, la sauce sélectionnée, et un timer qui indique le temps écoulé depuis l'envoi de la commande.
- Les commandes peuvent être validées et retirées de la liste une fois prêtes.

## Prérequis

Pour faire fonctionner ce projet, assurez-vous d'avoir les éléments suivants installés sur votre machine :

- **Navigateur web** (Chrome, Firefox, Safari, etc.)
- **Serveur local** (pour tester l'application localement via `localhost`, ou ouvrir directement le fichier HTML dans votre navigateur)

## Installation

1. **Clonez le repository :**

   ```bash
   git clone https://github.com/mballuais/Partiel-JS-A2.git
