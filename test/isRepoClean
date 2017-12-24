#!/bin/sh

# colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

error(){
   echo $RED$1$NC
   exit 1
}

success(){
   echo $GREEN$1$NC
}


# everything commited?
# https://unix.stackexchange.com/questions/155046/determine-if-git-working-directory-is-clean-from-a-script
if [ -z "$(git status --porcelain)" ]; then
  success "no uncommited changes - fine"
else
  error " uncommitted changes - please commit first and push"
fi


# everything pushed to server?
# https://stackoverflow.com/questions/2016901/viewing-unpushed-git-commits#2016954
if [ -z "$(git log origin/master..HEAD)" ]; then
  success "no local commits found - fine"
else
  error "local commits found - please push first"
fi




# https://github.com/lerna/lerna/issues/986
