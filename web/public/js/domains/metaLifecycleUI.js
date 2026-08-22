'use strict';
(()=>{
 if(window.CartMetaLifecycleDomain)return;
 CartDomains.claim('metaLifecycleUI','domains/metaLifecycleUI.js',()=>{
  function installReactionTransport(){if(SocketClient.__domainReactionTransport)return;SocketClient.__domainReactionTransport=true;const base=SocketClient.subscribeRoom.bind(SocketClient);SocketClient.subscribeRoom=async function(code){await base(code);const channel=this.channel;if(channel&&!channel.__domainReactionTransport){channel.__domainReactionTransport=true;channel.bind('reaction',data=>this._emit('reaction',data));}};if(!SocketClient.__domainReactionListener){SocketClient.__domainReactionListener=true;SocketClient.on('reaction',data=>window.CartReactionsDomain?.showReaction?.(data));}}
  installReactionTransport();
  window.CartMetaLifecycleDomain={installReactionTransport};
 });
})();
