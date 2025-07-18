#!/bin/bash

git tag -a stage08-delete-customer -m "completed stage08 delete customer"
git tag -a stage09-optional01-base-complete -m "stage09-optional01-base-complete"
git tag -a stage10-optional01-additional01-complete -m "stage10-optional01-additional01-complete"
git tag -a stage11-optional01-additional02-complete -m "stage11-optional01-additional02-complete"
git tag -a stage13-optional02-base-complete -m "stage13-optional02-base-complete"

git push --tags

