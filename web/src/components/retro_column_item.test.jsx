/*
 * Postfacto, a free, open-source and self-hosted retro tool aimed at helping
 * remote teams.
 *
 * Copyright (C) 2016 - Present Pivotal Software, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 *
 * it under the terms of the GNU Affero General Public License as
 *
 * published by the Free Software Foundation, either version 3 of the
 *
 * License, or (at your option) any later version.
 *
 *
 *
 * This program is distributed in the hope that it will be useful,
 *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *
 * GNU Affero General Public License for more details.
 *
 *
 *
 * You should have received a copy of the GNU Affero General Public License
 *
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import Scroll from 'react-scroll';
import {SpyDispatcher} from '../spec_helper';

import RetroColumnItem from './retro_column_item';

describe('RetroColumnItem', () => {
  const retroId = 'retro-slug-123';
  const item = {
    id: 2,
    description: 'the happy retro item',
    vote_count: 1,
    category: 'happy',
    done: false,
  };
  const item_done = {
    id: 20,
    description: 'the discussed retro item',
    vote_count: 10,
    category: 'happy',
    done: true,
  };

  describe('when opening the app on desktop', () => {
    beforeEach(() => {
      ReactDOM.render(<RetroColumnItem retroId={retroId} item={item} highlighted_item_id={null} archives={false} isMobile={false}/>, root);
    });
    describe('when rendering a RetroColumnItem', () => {
      it('item has all its data', () => {
        expect('.vote-count').toHaveText(1);
        expect('.item-text').toHaveText('the happy retro item');
      });

      describe('when clicking edit button', () => {
        beforeEach(() => {
          $('.item-edit i').simulate('click');
        });

        it('displays an edit menu', () => {
          expect($('.retro-item').attr('class')).toContain('editing');
        });

        describe('when clicking delete button', () => {
          it('dispatches a delete action', () => {
            $('.edit-delete i').simulate('click');
            expect(SpyDispatcher).toHaveReceived({
              type: 'deleteRetroItem',
              data: {retro_id: retroId, item},
            });
          });
        });

        describe('when clicking on the item description', () => {
          it('does not highlight the item', () => {
            $('.edit-text').simulate('click');
            expect(SpyDispatcher).not.toHaveReceived('highlightRetroItem');
          });
        });

        describe('when editing the description with non empty value', () => {
          beforeEach(() => {
            $('.edit-text textarea').val('an updated retro item').simulate('change');
          });

          const sharedUpdateItemBehavior = () => {
            it('updates the retro item', () => {
              expect(SpyDispatcher).toHaveReceived({
                type: 'updateRetroItem',
                data: {retro_id: retroId, item, description: 'an updated retro item'},
              });
            });

            it('hides the edit menu on done button click', () => {
              expect($('.retro-item').attr('class')).not.toContain('editing');
            });
          };

          describe('when save button is clicked', () => {
            beforeEach(() => {
              $('.edit-save').simulate('click');
            });

            sharedUpdateItemBehavior();
          });

          describe('when enter key is pressed', () => {
            beforeEach(() => {
              $('.edit-text textarea').simulate('keyPress', {key: 'Enter'});
            });

            sharedUpdateItemBehavior();
          });
        });

        describe('when editing the description with empty value', () => {
          beforeEach(() => {
            $('.edit-text textarea').val('').simulate('change');
          });

          it('disables the Save button', () => {
            expect($('.edit-save').attr('class')).toContain('disabled');
          });

          it('does not allow item to be updated', () => {
            $('.edit-save').simulate('click');
            expect(SpyDispatcher).not.toHaveReceived('updateRetroItem');
          });
        });
      });

      describe('when clicking vote button', () => {
        it('dispatches a vote action', () => {
          $('.item-vote-submit').simulate('click');
          item.vote_count++;
          expect(SpyDispatcher).toHaveReceived({
            type: 'voteRetroItem',
            data: {retro_id: retroId, item},
          });
        });
      });

      describe('when clicking on item text', () => {
        it('highlights the item', () => {
          $('.item-text button').simulate('click');
          expect(SpyDispatcher).toHaveReceived({
            type: 'highlightRetroItem',
            data: {retro_id: retroId, item},
          });
        });
      });
    });

    describe('when a different item is highlighted', () => {
      beforeEach(() => {
        ReactDOM.render(<RetroColumnItem retroId={retroId} item={item} highlighted_item_id={5} archives={false} isMobile={false}/>, root);
      });
      it('contains additional class lowlight', () => {
        expect($('.retro-item').attr('class')).toContain('lowlight');
      });

      it('hides edit button', () => {
        expect('.item-edit i').toHaveLength(0);
      });
    });

    describe('when the item becomes highlighted', () => {
      it('changes class and scrolls to the centre of the screen', () => {
        const $item = $('.retro-item');
        expect($item.attr('class')).not.toContain('highlight');
        spyOn(Scroll.scroller, 'scrollTo');

        ReactDOM.render(<RetroColumnItem retroId={retroId} item={item} highlighted_item_id={2} archives={false} isMobile={false}/>, root);

        expect($item.attr('class')).toContain('highlight');

        expect(Scroll.scroller.scrollTo).toHaveBeenCalledWith('retro-item-2', jasmine.objectContaining({
          delay: 0,
          duration: 300,
        }));
      });
    });

    describe('when the item is already highlighted', () => {
      let highlightedItem;

      beforeEach(() => {
        // Set highlightedItem before each test to guard against leaks from previous tests
        highlightedItem = {
          id: 2,
          description: 'the happy retro item',
          vote_count: 1,
          category: 'happy',
          done: false,
        };

        ReactDOM.render(<RetroColumnItem retroId={retroId} item={highlightedItem} highlighted_item_id={2} archives={false} isMobile={false}/>, root);
      });

      it('contains additional class highlight', () => {
        expect($('.retro-item').attr('class')).toContain('highlight');
      });

      it('does not scroll when highlighted again', () => {
        spyOn(Scroll.scroller, 'scrollTo');
        ReactDOM.render(<RetroColumnItem retroId={retroId} item={highlightedItem} highlighted_item_id={2} archives={false} isMobile={false}/>, root);
        expect(Scroll.scroller.scrollTo).not.toHaveBeenCalled();
      });

      describe('when clicking on item text', () => {
        it('unhighlights the item', () => {
          $('.item-text button').simulate('click');
          expect(SpyDispatcher).toHaveReceived({
            type: 'unhighlightRetroItem',
            data: {retro_id: retroId},
          });
        });
      });

      describe('when clicking on done', () => {
        it('sets the item to discussed', () => {
          $('.item-done').simulate('click');
          expect(SpyDispatcher).toHaveReceived({
            type: 'doneRetroItem',
            data: {retroId, item: highlightedItem},
          });
        });
      });

      describe('when clicking on cancel', () => {
        it('unhighlights the item', () => {
          $('.retro-item-cancel').simulate('click');
          expect(SpyDispatcher).toHaveReceived({
            type: 'unhighlightRetroItem',
            data: {retro_id: retroId},
          });
        });
      });
    });

    describe('when this item is discussed', () => {
      beforeEach(() => {
        ReactDOM.render(<RetroColumnItem retroId={retroId} item={item_done} highlighted_item_id={null} archives={false} isMobile={false}/>, root);
      });
      it('contains additional class discussed', () => {
        expect($('.retro-item').attr('class')).toContain('discussed');
      });

      it('hides the edit button', () => {
        expect('.item-edit').toHaveLength(0);
      });

      describe('when the item is highlighted and the cancel button is clicked', () => {
        beforeEach(() => {
          ReactDOM.render(<RetroColumnItem retroId={retroId} item={item_done} highlighted_item_id={20} archives={false} isMobile={false}/>, root);
        });

        it('dispatches undoneRetroItem', () => {
          $('.retro-item-cancel').simulate('click');

          expect(SpyDispatcher).toHaveReceived({
            type: 'undoneRetroItem',
            data: {
              item: {
                id: 20,
                description: 'the discussed retro item',
                vote_count: 10,
                category: 'happy',
                done: false,
              },
              retroId,
            },
          });
        });
      });
    });

    describe('when rendering an ARCHIVES RetroColumnItem', () => {
      beforeEach(() => {
        ReactDOM.render(<RetroColumnItem retroId={retroId} item={item} highlighted_item_id={null} archives isMobile={false}/>, root);
      });

      it('does not highlight an item when clicked', () => {
        $('.item-text button').simulate('click');
        expect(SpyDispatcher).not.toHaveReceived('highlightRetroItem');
      });

      describe('when clicking vote button', () => {
        it('does not dispatch a vote action', () => {
          $('.item-vote-submit').simulate('click');
          expect(SpyDispatcher).not.toHaveReceived('voteRetroItem');
        });
      });

      it('should not have a delete', () => {
        expect('.item-delete').toHaveLength(0);
      });
    });
  });

  describe('when opening the app on mobile', () => {
    beforeEach(() => {
      ReactDOM.render(<RetroColumnItem retroId={retroId} item={item} highlighted_item_id={1} archives={false} isMobile/>, root);
    });

    describe('when clicking on an item', () => {
      it('does not highlight the item ', () => {
        $('.item-text button').simulate('click');
        expect(SpyDispatcher).not.toHaveReceived('highlightRetroItem');
      });
    });

    describe('when clicking on done', () => {
      beforeEach(() => {
        ReactDOM.render(<RetroColumnItem retroId={retroId} item={item} highlighted_item_id={2} archives={false} isMobile/>, root);
      });
      it('does not done the item ', () => {
        $('.item-done').simulate('click');
        expect(SpyDispatcher).not.toHaveReceived('doneRetroItem');
      });
    });
  });
});
