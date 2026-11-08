export function authorizeModification(req, res, next) {
  const { role, id } = req.user || {};
  const isParent = role === "parent";
  const isChildSelf =
    role === "child" && String(req.params.userId) === String(id);

  if (!isParent && !isChildSelf) {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
}
