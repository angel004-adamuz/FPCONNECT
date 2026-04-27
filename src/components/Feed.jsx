import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useFeed, useCreatePost, useLike } from '../hooks';
import { commentsService, postsService } from '../services';
import UserCard from './UserCard';

const getInitials = (user) => `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'FP';

const formatPostDate = (date) => new Date(date).toLocaleDateString('es-ES', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export default function Feed({ recommendations = [], following = [], onFollow, onUnfollow, onOpenProfile }) {
  const { user: authUser } = useAuthStore();
  const { showToast } = useUIStore();
  const { posts, loading, error, loadFeed, addPost, removePost, updatePost } = useFeed();
  const { createPost, loading: creatingPost } = useCreatePost();
  const { likePost, unlikePost } = useLike();

  const [postContent, setPostContent] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [commentInputs, setCommentInputs] = useState({});
  const [commentLoadingByPost, setCommentLoadingByPost] = useState({});
  const [likeLoadingByPost, setLikeLoadingByPost] = useState({});

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    try {
      const newPost = await createPost(postContent, visibility);
      addPost(newPost);
      setPostContent('');
      showToast('Post publicado correctamente', 'success');
    } catch (err) {
      showToast(err.message || 'Error al crear post', 'error');
    }
  };

  const handleLike = async (postId, isLiked) => {
    if (likeLoadingByPost[postId]) return;

    setLikeLoadingByPost((prev) => ({ ...prev, [postId]: true }));
    try {
      if (isLiked) {
        await unlikePost(postId);
        updatePost(postId, (prevPost) => ({
          ...prevPost,
          isLiked: false,
          likeCount: Math.max(0, (prevPost.likeCount || 0) - 1),
        }));
      } else {
        await likePost(postId);
        updatePost(postId, (prevPost) => ({
          ...prevPost,
          isLiked: true,
          likeCount: (prevPost.likeCount || 0) + 1,
        }));
      }
    } catch {
      // Keep the like action quiet. The feed state remains unchanged on failure.
    } finally {
      setLikeLoadingByPost((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleCreateComment = async (postId) => {
    const content = (commentInputs[postId] || '').trim();
    if (!content) {
      showToast('Escribe un comentario antes de enviar', 'error');
      return;
    }

    if (commentLoadingByPost[postId]) return;

    setCommentLoadingByPost((prev) => ({ ...prev, [postId]: true }));
    try {
      const response = await commentsService.createComment(postId, content);
      const newComment = response.data;

      updatePost(postId, (prevPost) => ({
        ...prevPost,
        comments: [newComment, ...(prevPost.comments || [])].slice(0, 3),
        commentCount: (prevPost.commentCount || 0) + 1,
      }));

      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      showToast('Comentario publicado', 'success');
    } catch (err) {
      showToast(err.message || 'No se pudo publicar el comentario', 'error');
    } finally {
      setCommentLoadingByPost((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await postsService.deletePost(postId);
      removePost(postId);
      showToast('Post eliminado correctamente', 'success');
    } catch (err) {
      showToast(err.message || 'No se pudo eliminar el post', 'error');
    }
  };

  return (
    <div className="fp-feed">
      <section className="fp-composer" aria-label="Crear publicación">
        <form onSubmit={handleCreatePost}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, var(--fp-accent), #08795c)',
              fontWeight: 900,
              boxShadow: '0 12px 30px rgba(0, 201, 139, 0.24)',
            }}>
              {getInitials(authUser)}
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#fff' }}>Comparte algo útil</div>
              <div style={{ color: 'var(--fp-muted)', fontSize: 13 }}>Ideas, dudas, proyectos, ofertas o centros que molan.</div>
            </div>
          </div>

          <textarea
            className="fp-textarea"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Cuenta qué estás aprendiendo, qué buscas o qué has descubierto..."
          />

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
            <select
              className="fp-select"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              style={{ width: 'auto', minWidth: 150 }}
              aria-label="Visibilidad de la publicación"
            >
              <option value="PUBLIC">Público</option>
              <option value="PRIVATE">Privado</option>
              <option value="FRIENDS_ONLY">Solo conexiones</option>
            </select>

            <button
              className="fp-button"
              type="submit"
              disabled={creatingPost || !postContent.trim()}
              style={{ marginLeft: 'auto' }}
            >
              {creatingPost ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div className="fp-empty" style={{ borderColor: 'rgba(251, 113, 133, 0.32)', color: '#fecdd3' }}>
          {error}
        </div>
      )}

      {loading && (
        <div className="fp-empty">Cargando actividad...</div>
      )}

      {posts.length === 0 && !loading && (
        <section className="fp-empty">
          <h3 style={{ marginBottom: 8, color: '#fff' }}>Tu feed está esperando movimiento</h3>
          <p style={{ maxWidth: 520, margin: '0 auto', lineHeight: 1.55 }}>
            Publica algo o sigue perfiles para que FPConnect empiece a parecerse a tu red real.
          </p>

          {recommendations?.length > 0 && (
            <div style={{ textAlign: 'left', marginTop: 28 }}>
              <h3 style={{ fontSize: 15, color: '#fff', marginBottom: 14 }}>Perfiles para empezar</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {recommendations.slice(0, 4).map((recommendedUser) => {
                  const isFollowing = following?.find((u) => u.id === recommendedUser.id);
                  return (
                    <UserCard
                      key={recommendedUser.id}
                      user={recommendedUser}
                      actions
                      isFollowing={!!isFollowing}
                      onFollow={() => onFollow?.(recommendedUser.id)}
                      onUnfollow={() => onUnfollow?.(recommendedUser.id)}
                      onOpenProfile={onOpenProfile}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {posts.map((post) => (
        <article className="fp-post" key={post.id}>
          <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <button
              type="button"
              onClick={() => post.author?.id && onOpenProfile?.(post.author.id)}
              title="Ver perfil"
              style={{
                width: 46,
                height: 46,
                borderRadius: 15,
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'linear-gradient(135deg, var(--fp-accent), #08795c)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontSize: 16,
                fontWeight: 900,
                cursor: post.author?.id && onOpenProfile ? 'pointer' : 'default',
                flexShrink: 0,
              }}
            >
              {getInitials(post.author)}
            </button>

            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {post.author?.firstName} {post.author?.lastName}
              </div>
              <div style={{ color: 'var(--fp-soft)', fontSize: 12 }}>
                {post.author?.role || 'FPConnect'} · {formatPostDate(post.createdAt)}
              </div>
            </div>

            <span className="fp-chip" style={{ marginLeft: 'auto', cursor: 'default' }}>
              {post.visibility === 'PRIVATE' ? 'Privado' : post.visibility === 'FRIENDS_ONLY' ? 'Conexiones' : 'Público'}
            </span>
          </header>

          <p style={{ color: 'rgba(248, 250, 252, 0.9)', fontSize: 15, lineHeight: 1.68, margin: '0 0 16px' }}>
            {post.content}
          </p>

          <div style={{
            display: 'flex',
            gap: 14,
            padding: '12px 0',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--fp-muted)',
            fontSize: 13,
          }}>
            <span>{post.likeCount || 0} me gusta</span>
            <span>{post.commentCount || 0} comentarios</span>
          </div>

          <div className={`fp-post-actions ${post.author?.id === authUser?.id ? 'fp-post-actions--owner' : 'fp-post-actions--default'}`}>
            <button
              className={`fp-button ${post.isLiked ? '' : 'fp-button--ghost'}`}
              onClick={() => handleLike(post.id, post.isLiked)}
              disabled={!!likeLoadingByPost[post.id]}
              type="button"
            >
              {likeLoadingByPost[post.id] ? 'Procesando...' : post.isLiked ? 'Te gusta' : 'Me gusta'}
            </button>

            <button
              className="fp-button fp-button--ghost"
              onClick={() => handleCreateComment(post.id)}
              disabled={!!commentLoadingByPost[post.id]}
              type="button"
            >
              {commentLoadingByPost[post.id] ? 'Enviando...' : 'Comentar'}
            </button>

            {post.author?.id === authUser?.id && (
              <button
                className="fp-button fp-button--danger"
                onClick={() => handleDeletePost(post.id)}
                type="button"
              >
                Eliminar
              </button>
            )}
          </div>

          <div style={{ marginTop: 12 }}>
            <input
              className="fp-input"
              type="text"
              value={commentInputs[post.id] || ''}
              onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
              placeholder="Escribe una respuesta rápida..."
            />
          </div>

          {post.comments?.length > 0 && (
            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              {post.comments.slice(0, 3).map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.055)',
                    border: '1px solid rgba(255,255,255,0.09)',
                  }}
                >
                  <div style={{ fontSize: 12, color: 'var(--fp-muted)', marginBottom: 4, fontWeight: 700 }}>
                    {comment.author?.firstName} {comment.author?.lastName}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(248, 250, 252, 0.86)', lineHeight: 1.5 }}>{comment.content}</div>
                </div>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
