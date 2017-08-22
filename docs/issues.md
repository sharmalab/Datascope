## List of known issues


1. No spaces/special characters allowed in columnames. Underscores are fine.
2. All rowCharts/pieCharts must have `datatype: enum` in their `dataDescription.json`. The Authoring tool doesn't do this.
3. Issues might arise due to missing values/blanks
4. Type mismatches. Ex:  If `dataDescription.json` has integer datatype for an attribute and it has strings
