package com.odde.donut.controllers;

import com.odde.donut.controllers.dto.NoteRealm;
import com.odde.donut.controllers.dto.WikiLink;
import com.odde.donut.entities.Note;
import com.odde.donut.entities.Notebook;
import com.odde.donut.exceptions.UnexpectedNoAccessRightException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class IntentCoverageTitlePrecedenceWitnessTests extends ControllerTestBase {
  @Autowired NoteController controller;

  @Test
  void independentlyObservesAuthoredLinkDestinations() throws UnexpectedNoAccessRightException {
    currentUser.setUser(makeMe.aUser().please());
    Notebook notebook =
        makeMe.aNotebook().creatorAndOwner(currentUser.getUser()).name("Colors").please();
    Note title = makeMe.aNote().notebook(notebook).title("color").please();
    makeMe.aNote().notebook(notebook).title("colour").aliases("color").please();
    makeMe.aNote().notebook(notebook).title("shade").aliases("color").please();
    String content = "---\nscalar: '[[color|Scalar]]'\nlist:\n  - '[[color|List]]'\n---\n[[color]] [[color|Read this]] [[Colors:color]] [[COLOR|Case]]\n";
    Note source = makeMe.aNote().notebook(notebook).content(content).please();
    NoteRealm realm = controller.showNote(source);
    System.out.println("INTENT_WITNESS expectedTitleId=" + title.getId()
        + " linkCount=" + realm.getWikiLinks().size());
    for (WikiLink link : realm.getWikiLinks()) {
      System.out.println("INTENT_WITNESS authored=" + link.getAuthoredLink()
          + " resolution=" + link.getResolution()
          + " destination=" + link.getDestinationNoteId()
          + " display=" + link.getDisplayText());
    }
  }
}
