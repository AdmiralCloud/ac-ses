module.exports = {
  target: (dependencyName, parsedVersion) => {
    return dependencyName === 'chai' ? 'minor' : 'latest'
  }
}