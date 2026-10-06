import { messages, sessionLabel } from '../../mock/session';
import { SectionLabel } from '../ui/SectionLabel';
import { ClaudeTurn } from './ClaudeTurn';
import { Composer } from './Composer';
import { RiffingBar } from './RiffingBar';
import { UserBubble } from './UserBubble';
import styles from './ChatPanel.module.css';

export function ChatPanel() {
  return (
    <section aria-label="Conversation" className={styles.panel}>
      <div className={styles.thread}>
        <SectionLabel>{sessionLabel}</SectionLabel>
        {messages.map((message) =>
          message.role === 'user' ? (
            <UserBubble key={message.id} text={message.text} mention={message.mention} />
          ) : (
            <ClaudeTurn key={message.id} message={message} />
          ),
        )}
        <RiffingBar />
      </div>
      <Composer />
    </section>
  );
}
